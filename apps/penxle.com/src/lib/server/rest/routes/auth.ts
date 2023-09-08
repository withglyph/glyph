import dayjs from 'dayjs';
import { error, status } from 'itty-router';
import { updateUser } from '$lib/server/analytics';
import { google } from '$lib/server/external-api';
import { createAccessToken } from '$lib/server/utils';
import { createRandomAvatar, renderAvatar } from '$lib/server/utils/avatar';
import { directUploadImage } from '$lib/server/utils/image';
import { createId } from '$lib/utils';
import { createRouter } from '../router';

export const auth = createRouter();

auth.get('/auth/google', async (_, { db, ...context }) => {
  const code = context.url.searchParams.get('code');
  if (!code) {
    return error(400);
  }

  const googleUser = await google.authorizeUser(context, code);

  let sso = await db.userSSO.findUnique({
    where: {
      provider_providerUserId: {
        provider: 'GOOGLE',
        providerUserId: googleUser.id,
      },
    },
  });
  let user = await db.user.findUnique({
    select: { id: true },
    where: { email: googleUser.email },
  });
  if (context.session) {
    if (sso) {
      // 로그인도 되어 있고 구글 계정 연동도 된 경우 -> 무처리 or 에러
      if (sso.userId !== context.session.userId) {
        return error(400);
      }
    } else {
      if (user && user.id !== context.session.userId) {
        // 연동은 안되어 있지만 구글 이메일과 같은 계정이 있는 경우 (아마 공용 컴에서 잘못된 사용자로 구글 계정 연동을 시도하는 경우?)
        return error(400);
      }
      sso = await db.userSSO.create({
        data: {
          id: createId(),
          provider: 'GOOGLE',
          providerUserId: googleUser.id,
          user: { connect: { id: context.session.userId } },
        },
      });
    }
  } else {
    // 로그인 상태가 아님 -> 세션 생성 필요
    if (sso) {
      // 구글 계정으로 가입한 적 있어서 로그인
      context.track('user:login', {
        $user_id: sso.userId,
        method: 'google',
      });
    } else {
      if (user) {
        // 구글 이메일과 같은 계정이 있는 경우
        context.track('user:login', {
          $user_id: user.id,
          method: 'google',
        });
      } else {
        // TODO: 아바타를 구글 계정걸로 적용해야함
        const randomAvatar = createRandomAvatar();
        const avatarId = await directUploadImage({
          db,
          name: 'random-avatar.png',
          buffer: await renderAvatar(randomAvatar),
        });

        user = await db.user.create({
          data: {
            id: createId(),
            email: googleUser.email,
            state: 'ACTIVE',
            profile: {
              create: {
                id: createId(),
                name: googleUser.name,
                avatarId,
              },
            },
          },
        });

        await db.image.update({
          where: { id: avatarId },
          data: { userId: user.id },
        });

        context.track('user:sign-up', {
          $user_id: user.id,
          method: 'email',
        });
      }

      sso = await db.userSSO.create({
        data: {
          id: createId(),
          userId: user.id,
          provider: 'GOOGLE',
          providerUserId: googleUser.id,
        },
      });
    }

    const session = await db.session.create({
      select: { id: true },
      data: { id: createId(), userId: sso.userId },
    });

    const accessToken = await createAccessToken(session.id);
    context.cookies.set('penxle-at', accessToken, {
      path: '/',
      maxAge: dayjs.duration(1, 'year').asSeconds(),
    });

    await updateUser(db, context, sso.userId);
  }
  // TODO: 최종 리다이렉트 경로를 논의해봐야 할듯
  return status(301, { headers: { Location: '/' } });
});
