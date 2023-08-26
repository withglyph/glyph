import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { router } from '@penxle/lambda/http';
import { installPolyfills } from '@sveltejs/kit/node/polyfills';
import { manifest, prerendered } from 'MANIFEST';
import mime from 'mime-types';
import { Server } from 'SERVER';
import type { LambdaRequest } from '@penxle/lambda/http';

installPolyfills();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = new Server(manifest);
await server.init({ env: process.env as Record<string, string> });

const assets = async (request: LambdaRequest) => {
  if (
    manifest.assets.has(request.params.path) ||
    request.params.path.startsWith(manifest.appPath)
  ) {
    const buffer = await fs.readFile(
      path.join(__dirname, '_assets', request.params.path),
    );
    const immutable = request.params.path.includes('immutable');

    return new Response(buffer, {
      headers: {
        'content-type':
          mime.lookup(request.params.path) || 'application/octet-stream',
        'cache-control': immutable
          ? 'public, max-age=31536000, immutable'
          : 'public, max-age=0, must-revalidate',
      },
    });
  }
};

const prerender = async (request: LambdaRequest) => {
  if (prerendered.has(request.params.path)) {
    const candidates = [
      path.join(__dirname, '_assets', `${request.params.path}.html`),
      path.join(__dirname, '_assets', request.params.path, 'index.html'),
    ];

    for (const candidate of candidates) {
      if (!(await fs.stat(candidate).catch(() => null))) {
        return;
      }

      const buffer = await fs.readFile(candidate);

      return new Response(buffer, {
        headers: {
          'content-type':
            mime.lookup(request.params.path) || 'application/octet-stream',
          'cache-control': 'public, max-age=0, must-revalidate',
        },
      });
    }
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
