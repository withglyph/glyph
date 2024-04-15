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

export const opengraph = createRouter();

const DefaultCover = await got('https://glyph.pub/assets/opengraph/default-cover-light.png').buffer();
const SUITRegular = await got('https://glyph.pub/assets/fonts/SUIT-Regular.otf').buffer();
const SUITMedium = await got('https://glyph.pub/assets/fonts/SUIT-Medium.otf').buffer();
const SUITBold = await got('https://glyph.pub/assets/fonts/SUIT-Bold.otf').buffer();
const KoPubWorldDotumLight = await got('https://glyph.pub/assets/fonts/KoPubWorldDotumLight.otf').buffer();
const KoPubWorldDotumMedium = await got('https://glyph.pub/assets/fonts/KoPubWorldDotumMedium.otf').buffer();
const KoPubWorldDotumBold = await got('https://glyph.pub/assets/fonts/KoPubWorldDotumBold.otf').buffer();

opengraph.get('/opengraph/post/:postId', async (request) => {
  const postId = request.params.postId;

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
                    width: 126,
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
                      display: 'block',
                      marginTop: '12px',
                      fontSize: '58px',
                      fontWeight: 700,
                      lineHeight: '1.2',
                      letterSpacing: '-0.004em',
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
                            display: 'block',
                            marginTop: '2px',
                            paddingLeft: '2px',
                            fontSize: '30px',
                            fontWeight: 500,
                            lineHeight: '1.44',
                            letterSpacing: '-0.004em',
                            wordBreak: 'break-all',
                            lineClamp: 2,
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
                      opacity: 0.7,
                      fontSize: '28px',
                      fontWeight: 400,
                      lineHeight: '1.2',
                      letterSpacing: '-0.004em',
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
                      display: 'block',
                      opacity: 0.6,
                      marginTop: '3px',
                      fontSize: '28px',
                      fontWeight: 400,
                      lineHeight: '1.2',
                      letterSpacing: '-0.004em',
                      wordBreak: 'break-all',
                      lineClamp: 1,
                    },
                  },
                },
              ],
              style: {
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
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
                      right: '0',
                      objectFit: 'cover',
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
          paddingTop: '117px',
          paddingBottom: '86px',
          paddingLeft: '54px',
          paddingRight: post.thumbnail ? '474px' : '54px',
          color: '#FDFDFD',
          backgroundColor: '#171717',
          fontFamily: 'SUIT, KoPubWorldDotum',
        },
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'SUIT', data: SUITRegular, weight: 400, style: 'normal' },
        { name: 'SUIT', data: SUITMedium, weight: 500, style: 'normal' },
        { name: 'SUIT', data: SUITBold, weight: 700, style: 'normal' },
        { name: 'KoPubWorldDotum', data: KoPubWorldDotumLight, weight: 400, style: 'normal' },
        { name: 'KoPubWorldDotum', data: KoPubWorldDotumMedium, weight: 500, style: 'normal' },
        { name: 'KoPubWorldDotum', data: KoPubWorldDotumBold, weight: 700, style: 'normal' },
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
