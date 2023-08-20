import { manifest } from '0MANIFEST';
import { Server } from '0SERVER';
import { createRequest, createResult } from './interop';
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';

const server = new Server(manifest);

export const handler = (async (event) => {
  await server.init({ env: process.env as Record<string, string> });
  const request = createRequest(event);

  const response = await server.respond(request, {
    getClientAddress: () => event.requestContext.http.sourceIp,
    platform: { event },
  });

  return createResult(response);
}) satisfies APIGatewayProxyHandlerV2;

void handler({
  version: '2.0',
  routeKey: '$default',
  rawPath: '/',
  rawQueryString: 'parameter1=value1&parameter1=value2&parameter2=value',
  cookies: ['cookie1', 'cookie2'],
  headers: {
    header1: 'value1',
    header2: 'value1,value2',
  },
  queryStringParameters: {
    parameter1: 'value1,value2',
    parameter2: 'value',
  },
  requestContext: {
    accountId: '123456789012',
    apiId: 'api-id',
    domainName: 'id.execute-api.us-east-1.amazonaws.com',
    domainPrefix: 'id',
    http: {
      method: 'GET',
      path: '/my/path',
      protocol: 'HTTP/1.1',
      sourceIp: '192.0.2.1',
      userAgent: 'agent',
    },
    requestId: 'id',
    routeKey: '$default',
    stage: '$default',
    time: '12/Mar/2020:19:03:58 +0000',
    timeEpoch: 1_583_348_638_390,
  },
  // body: 'Hello from Lambda',
  pathParameters: {
    parameter1: 'value1',
  },
  isBase64Encoded: false,
  stageVariables: {
    stageVariable1: 'value1',
    stageVariable2: 'value2',
  },
}).then(console.log);
