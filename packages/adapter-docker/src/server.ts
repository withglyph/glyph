import fs from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { getRequest, setResponse } from '@sveltejs/kit/node';
import { createApp, eventHandler, sendStream, setHeaders, toNodeListener } from 'h3';
import * as mrmime from 'mrmime';
import type { Server, SSRManifest } from '@sveltejs/kit';

type CreateHandlerParams = {
  basePath: string;
  Server: typeof Server;
  manifest: SSRManifest;
  prerendered: Record<string, string>;
};

export const serve = async ({ basePath, Server, manifest, prerendered }: CreateHandlerParams) => {
  const server = new Server(manifest);
  await server.init({ env: process.env as Record<string, string> });

  const healthz = eventHandler(async (event) => {
    if (event.path === '/healthz') {
      setHeaders(event, {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=0, must-revalidate',
      });
      return { '*': true };
    }
  });

  const assets = eventHandler(async (event) => {
    const pathname = event.path.slice(1);

    if (manifest.assets.has(pathname) || pathname.startsWith(manifest.appPath)) {
      const immutable = pathname.startsWith(`${manifest.appPath}/immutable`);
      const filePath = path.join(basePath, 'client', pathname);

      const size = fs.statSync(filePath).size;
      const stream = fs.createReadStream(filePath);

      setHeaders(event, {
        'content-type': mrmime.lookup(pathname) || 'application/octet-stream',
        'content-length': size,
        'cache-control': immutable ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate',
      });
      await sendStream(event, stream);
    }
  });

  const prerender = eventHandler(async (event) => {
    const pathname = event.path;

    if (pathname in prerendered) {
      const filePath = path.join(basePath, 'client', prerendered[pathname]);

      const size = fs.statSync(filePath).size;
      const stream = fs.createReadStream(filePath);

      setHeaders(event, {
        'content-type': 'text/html',
        'content-length': size,
        'cache-control': 'public, max-age=0, must-revalidate',
      });
      await sendStream(event, stream);
    }
  });

  const sveltekit = eventHandler(async (event) => {
    const protocol = event.headers.get('x-forwarded-proto') ?? 'https';
    const host = process.env.HTTP_HOST ?? event.headers.get('host');

    const request = await getRequest({
      request: event.node.req,
      base: `${protocol}://${host}`,
    });

    const response = await server.respond(request, {
      getClientAddress: () => {
        const xff = request.headers.get('x-forwarded-for');
        const hop = Number(process.env.HTTP_XFF_HOP) || 0;

        if (xff && hop > 0) {
          const addresses = xff.split(',');
          return addresses.at(-hop)?.trim() ?? '';
        }

        return event.context.clientAddress ?? '';
      },
    });

    if (response.headers.get('cache-control') === null) {
      response.headers.set('cache-control', 'private, no-cache');
    }

    await setResponse(event.node.res, response);
  });

  const app = createApp().use([healthz, assets, prerender, sveltekit]);
  createServer(toNodeListener(app)).listen(3000);
};
