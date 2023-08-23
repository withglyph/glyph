import fs from 'node:fs/promises';
import path from 'node:path';
import { router } from '@penxle/lambda/http';
import { installPolyfills } from '@sveltejs/kit/node/polyfills';
import { manifest, prerendered } from 'MANIFEST';
import mime from 'mime-types';
import { Server } from 'SERVER';
import type { LambdaRequest } from '@penxle/lambda/http';

installPolyfills();

const server = new Server(manifest);
await server.init({ env: process.env as Record<string, string> });

const assets = async (request: LambdaRequest) => {
  if (
    manifest.assets.has(request.params.path) ||
    request.params.path.startsWith(manifest.appPath)
  ) {
    const buffer = await fs.readFile(path.join('assets', request.params.path));

    return new Response(buffer, {
      headers: {
        'content-type':
          mime.lookup(request.params.path) || 'application/octet-stream',
        'cache-control': 'public, max-age=31536000, immutable',
      },
    });
  }
};

const prerender = async (request: LambdaRequest) => {
  if (prerendered.has(request.params.path)) {
    const buffer = await fs.readFile(
      path.join('prerendered', request.params.path),
    );

    return new Response(buffer, {
      headers: {
        'content-type':
          mime.lookup(request.params.path) || 'application/octet-stream',
        'cache-control': 'public, max-age=0, must-revalidate',
      },
    });
  }
};

const sveltekit = async (request: LambdaRequest) => {
  const response = await server.respond(request, {
    getClientAddress: () => request.event.requestContext.http.sourceIp,
    platform: { event: request.event },
  });

  if (response.headers.get('cache-control') === null) {
    response.headers.set('cache-control', 'private, no-cache');
  }

  return response;
};

router.all('/:path+', assets, prerender, sveltekit);

export { handler } from '@penxle/lambda/http';
