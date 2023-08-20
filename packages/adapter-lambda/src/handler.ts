import { installPolyfills } from '@sveltejs/kit/node/polyfills';
import { manifest } from 'MANIFEST';
import { Server } from 'SERVER';
import { createRequest, createResult } from './interop';
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';

installPolyfills();

const server = new Server(manifest);
await server.init({ env: process.env as Record<string, string> });

export const handler = (async (event) => {
  const request = createRequest(event);

  const response = await server.respond(request, {
    getClientAddress: () => event.requestContext.http.sourceIp,
    platform: { event },
  });

  return createResult(response);
}) satisfies APIGatewayProxyHandlerV2;
