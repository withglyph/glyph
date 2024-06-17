import { renderAsync } from '@resvg/resvg-js';
import got from 'got';
import { png } from 'itty-router';
import satori from 'satori';
import { renderSVG } from 'uqr';
import compactLogoRaw from '$assets/logos/compact.svg?raw';
import { createRouter } from '../router';

export const redeem = createRouter();

const AnonymousProBold = await got('https://glyph.pub/assets/fonts/AnonymousPro-Bold.ttf').buffer();

redeem.get('/redeem/qr/:code.png', async (request) => {
  const origin = new URL(request.url).origin;
  const code = request.params.code;

  const qr = renderSVG(`${origin}/me/redeem?code=${code}`, { ecc: 'H', border: 4 });
  const qrUrl = `data:image/svg+xml,${encodeURIComponent(qr)}`;
  const logoUrl = `data:image/svg+xml,${encodeURIComponent(compactLogoRaw)}`.replace('currentColor', 'white');

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'white',
          fontFamily: 'Anonymous Pro',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
              },
              children: [
                {
                  type: 'img',
                  props: {
                    src: qrUrl,
                    width: 512,
                    height: 512,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '128px',
                      height: '128px',
                      backgroundColor: 'black',
                      transform: 'translate(-50%, -50%)',
                    },
                    children: [
                      {
                        type: 'img',
                        props: {
                          src: logoUrl,
                          width: 64,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          // {
          //   type: 'div',
          //   props: {
          //     style: {
          //       display: 'flex',
          //       justifyContent: 'center',
          //       fontSize: '32px',
          //       fontWeight: 700,
          //     },
          //     children: code.match(/.{4}/g)?.join('-'),
          //   },
          // },
        ],
      },
    },
    {
      width: 512,
      fonts: [{ name: 'Anonymous Pro', data: AnonymousProBold, weight: 700, style: 'normal' }],
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
