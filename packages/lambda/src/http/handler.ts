import { createHandler } from '../handler';
import { createRequest, createResult } from './interop';
import { router } from './router';
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';

export const handler = createHandler((async (event) => {
  const request = createRequest(event);
  const response = (await router.handle(request, event)) as Response;
  return createResult(response);
}) satisfies APIGatewayProxyHandlerV2);
