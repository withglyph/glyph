import fs from 'node:fs/promises';
import path from 'node:path';
import { installPolyfills } from '@sveltejs/kit/node/polyfills';
import { Router } from 'itty-router';
import { manifest, prerendered } from 'MANIFEST';
import mime from 'mime-types';
import { Server } from 'SERVER';
import { createRequest, createResult } from './interop';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
} from 'aws-lambda';
import type { IRequest } from 'itty-router';

type LRequest = IRequest & { __L: true };

installPolyfills();

const server = new Server(manifest);
await server.init({ env: process.env as Record<string, string> });

const assets = async (request: LRequest) => {
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

const prerender = async (request: LRequest) => {
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

const sveltekit = async (request: LRequest, event: APIGatewayProxyEventV2) => {
  const response = await server.respond(request, {
    getClientAddress: () => event.requestContext.http.sourceIp,
    platform: { event },
  });

  if (response.headers.get('cache-control') === null) {
    response.headers.set('cache-control', 'private, no-cache');
  }

  return response;
};

const router = Router<LRequest, [event: APIGatewayProxyEventV2]>();
router.all('/:path+', assets, prerender, sveltekit);

export const handler = (async (event) => {
  const request = createRequest(event);
  const response = (await router.handle(request, event)) as Response;
  return createResult(response);
}) satisfies APIGatewayProxyHandlerV2;
