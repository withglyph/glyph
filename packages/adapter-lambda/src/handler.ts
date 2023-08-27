import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { router } from '@penxle/lambda/http';
import { installPolyfills } from '@sveltejs/kit/node/polyfills';
import { manifest, prerendered } from 'MANIFEST';
import mime from 'mime-types';
import { Server } from 'SERVER';
import type { LambdaRequest } from '@penxle/lambda/http';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';

installPolyfills();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = new Server(manifest);
await server.init({ env: process.env as Record<string, string> });

const assets = async (_: LambdaRequest, event: APIGatewayProxyEventV2) => {
  const pathname = event.rawPath.slice(1);

  if (manifest.assets.has(pathname) || pathname.startsWith(manifest.appPath)) {
    const buffer = await fs.readFile(path.join(__dirname, '_assets', pathname));
    const immutable = pathname.startsWith(`${manifest.appPath}/immutable`);

    return new Response(buffer, {
      headers: {
        'content-type': mime.lookup(pathname) || 'application/octet-stream',
        'cache-control': immutable
          ? 'public, max-age=31536000, immutable'
          : 'public, max-age=0, must-revalidate',
      },
    });
  }
};

const prerender = async (_: LambdaRequest, event: APIGatewayProxyEventV2) => {
  const pathname = event.rawPath;

  if (prerendered.has(pathname)) {
    const candidates = [
      path.join(__dirname, '_assets', `${pathname}.html`),
      path.join(__dirname, '_assets', pathname, 'index.html'),
    ];

    for (const candidate of candidates) {
      if (!(await fs.stat(candidate).catch(() => null))) {
        continue;
      }

      const buffer = await fs.readFile(candidate);

      return new Response(buffer, {
        headers: {
          'content-type': 'text/html',
          'cache-control': 'public, max-age=0, must-revalidate',
        },
      });
    }
  }
};

const sveltekit = async (
  request: LambdaRequest,
  event: APIGatewayProxyEventV2,
) => {
  console.log('Handling request', request);
  console.log('Handling event', event);

  try {
    const response = await server.respond(request, {
      getClientAddress: () => event.requestContext.http.sourceIp,
      platform: { event },
    });

    console.log('Handling response', response);

    if (response.headers.get('cache-control') === null) {
      response.headers.set('cache-control', 'private, no-cache');
    }

    return response;
  } catch (err) {
    console.error(err);
  }

  return 'Internal server error !!';
};

export const error = () => {
  return 'Internal server error !!';
};

router.all('*', assets, prerender, sveltekit, error);

export { handler } from '@penxle/lambda/http';
