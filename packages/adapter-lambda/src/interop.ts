import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';

export const createRequest = (event: APIGatewayProxyEventV2): Request => {
  const url = new URL(
    event.rawPath,
    `https://${event.requestContext.domainName}`,
  );

  const init: RequestInit = {
    method: event.requestContext.http.method,
    headers: new Headers(
      Object.entries(event.headers as Record<string, string>),
    ),
  };

  if (event.body && init.method !== 'GET' && init.method !== 'HEAD') {
    init.body = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : event.body;
  }

  return new Request(url, init);
};

export const createResult = async (
  response: Response,
): Promise<APIGatewayProxyResultV2> => {
  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers),
    // body: Buffer.from(await response.arrayBuffer()).toString('base64'),
    body: await response.text(),
    isBase64Encoded: false,
  };
};
