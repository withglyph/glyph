import { GetObjectCommand } from '@aws-sdk/client-s3';
import { renderAsync } from '@resvg/resvg-js';
import { and, eq } from 'drizzle-orm';
import got from 'got';
import { png } from 'itty-router';
import satori from 'satori';
import sharp from 'sharp';
import twemoji from 'twemoji';
import fullLogoRaw from '$assets/logos/full.svg?raw';
import { database, Images, PostRevisions, Posts, Profiles, SpaceMembers, Spaces } from '$lib/server/database';
import { s3 } from '$lib/server/external-api/aws';
import { createRouter } from '../router';
import type { IRequest } from 'itty-router';

export const opengraph = createRouter();

const DefaultCover = await got('https://glyph.pub/assets/opengraph/default-cover.png').buffer();
const PretendardLight = await got('https://glyph.pub/assets/fonts/Pretendard-Light.otf').buffer();
const PretendardRegular = await got('https://glyph.pub/assets/fonts/Pretendard-Regular.otf').buffer();
const PretendardSemibold = await got('https://glyph.pub/assets/fonts/Pretendard-SemiBold.otf').buffer();
const KoPubWorldDotumLight = await got('https://glyph.pub/assets/fonts/KoPubWorldDotumLight.otf').buffer();
const KoPubWorldDotumMedium = await got('https://glyph.pub/assets/fonts/KoPubWorldDotumMedium.otf').buffer();
const KoPubWorldDotumBold = await got('https://glyph.pub/assets/fonts/KoPubWorldDotumBold.otf').buffer();

opengraph.get('/opengraph/post/:postId', async (request) => {
  const postId = (request as IRequest).params.postId;

  const posts = await database
    .select({
      publishedRevision: { title: PostRevisions.title, subtitle: PostRevisions.subtitle },
      space: { name: Spaces.name },
      member: { name: Profiles.name },
      thumbnail: { path: Images.path },
    })
    .from(Posts)
    .innerJoin(PostRevisions, eq(PostRevisions.id, Posts.publishedRevisionId))
    .innerJoin(Spaces, eq(Spaces.id, Posts.spaceId))
    .innerJoin(SpaceMembers, eq(SpaceMembers.id, Posts.memberId))
    .innerJoin(Profiles, eq(Profiles.id, SpaceMembers.profileId))
    .leftJoin(Images, eq(Images.id, Posts.thumbnailId))
    .where(and(eq(Posts.id, postId), eq(Posts.state, 'PUBLISHED')));

  if (posts.length === 0) {
    return png(DefaultCover);
  }

  const [post] = posts;

  const logoUrl = `data:image/svg+xml,${encodeURIComponent(fullLogoRaw)}`.replace('currentColor', 'white');

  const svg = await satori(
    {
      type: 'div',
      props: {
        children: [
          {
            type: 'div',
            props: {
              children: [
                {
                  type: 'img',
                  props: {
                    src: logoUrl,
                    width: 125,
                    style: {
                      opacity: 0.4,
                    },
                  },
                },
                {
                  type: 'div',
                  props: {
                    children: post.publishedRevision.title ?? '(제목 없음)',
                    style: {
                      marginTop: '60px',
                      display: 'block',
                      fontSize: '60px',
                      fontWeight: 600,
                      lineHeight: '1.2',
                      letterSpacing: '0.01em',
                      wordBreak: 'break-all',
                      lineClamp: 2,
                    },
                  },
                },
                ...(post.publishedRevision.subtitle
                  ? [
                      {
                        type: 'div',
                        props: {
                          children: post.publishedRevision.subtitle,
                          style: {
                            marginTop: '8px',
                            display: 'block',
                            fontSize: '32px',
                            fontWeight: 400,
                            lineHeight: '1.2',
                            letterSpacing: '0.01em',
                            opacity: 0.8,
                            wordBreak: 'break-all',
                            lineClamp: 1,
                          },
                        },
                      },
                    ]
                  : []),
                {
                  type: 'div',
                  props: {
                    style: {
                      flexGrow: 1,
                    },
                  },
                },
                {
                  type: 'div',
                  props: {
                    children: post.space.name,
                    style: {
                      display: 'block',
                      fontSize: '28px',
                      fontWeight: 300,
                      lineHeight: '1.2',
                      letterSpacing: '0.01em',
                      opacity: 0.8,
                      wordBreak: 'break-all',
                      lineClamp: 1,
                    },
                  },
                },
                {
                  type: 'div',
                  props: {
                    children: `by ${post.member.name}`,
                    style: {
                      marginTop: '3px',
                      display: 'block',
                      fontSize: '27px',
                      fontWeight: 300,
                      lineHeight: '1.2',
                      letterSpacing: '0.01em',
                      opacity: 0.7,
                      wordBreak: 'break-all',
                      lineClamp: 1,
                    },
                  },
                },
              ],
              style: {
                display: 'flex',
                flexDirection: 'column',
                width: post.thumbnail ? '620px' : '100%',
                height: '100%',
              },
            },
          },
          ...(post.thumbnail
            ? [
                {
                  type: 'img',
                  props: {
                    src: await getS3ImageSrc(post.thumbnail.path),
                    width: 420,
                    height: 630,
                    style: {
                      position: 'absolute',
                      right: 0,
                      objectFit: 'cover',
                    },
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      position: 'absolute',
                      right: 0,
                      width: '420px',
                      height: '630px',
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    },
                  },
                },
              ]
            : []),
        ],
        style: {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          padding: '80px',
          color: '#ffffff',
          backgroundColor: '#18181B',
          fontFamily: 'Pretendard, KoPubWorldDotum',
        },
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Pretendard', data: PretendardLight, weight: 300, style: 'normal' },
        { name: 'Pretendard', data: PretendardRegular, weight: 400, style: 'normal' },
        { name: 'Pretendard', data: PretendardSemibold, weight: 600, style: 'normal' },
        { name: 'KoPubWorldDotum', data: KoPubWorldDotumLight, weight: 300, style: 'normal' },
        { name: 'KoPubWorldDotum', data: KoPubWorldDotumMedium, weight: 400, style: 'normal' },
        { name: 'KoPubWorldDotum', data: KoPubWorldDotumBold, weight: 600, style: 'normal' },
      ],
      loadAdditionalAsset: async (code, segment) => {
        if (code === 'emoji') {
          const codepoint = twemoji.convert.toCodePoint(segment);
          const svg = await got(`https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${codepoint}.svg`).text();
          return 'data:image/svg+xml,' + encodeURIComponent(svg);
        }

        return (
          'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>')
        );
      },
    },
  );

  const img = await renderAsync(svg, {
    font: { loadSystemFonts: false },
    imageRendering: 0,
    shapeRendering: 2,
    textRendering: 1,
  });

  return png(img.asPng());
});

const getS3ImageSrc = async (key: string) => {
  const object = await s3.send(new GetObjectCommand({ Bucket: 'penxle-data', Key: key }));
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const source = await object.Body!.transformToByteArray();
  const buffer = await sharp(source, { failOn: 'none' }).png().toBuffer();

  return `data:image/png;base64,${buffer.toString('base64')}`;
};
