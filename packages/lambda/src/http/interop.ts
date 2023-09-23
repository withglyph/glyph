import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

export const createRequest = (event: APIGatewayProxyEventV2): Request => {
  const proto = event.headers['x-forwarded-proto'] ?? 'https';
  const host = process.env.HTTP_HOST ?? event.headers.host ?? event.requestContext.domainName;

  const url = new URL(`${proto}://${host}${event.rawPath}?${event.rawQueryString}`);

  const init: RequestInit = {
    method: event.requestContext.http.method,
    headers: new Headers(Object.entries(event.headers as Record<string, string>)),
  };

  if (event.body) {
    init.body = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
  }

  return new Request(url, init);
};

const textTypes = [
  'text/',
  'application/graphql-response+json',
  'application/javascript',
  'application/json',
  'application/xml',
  'image/svg+xml',
];

export const createResult = async (response: Response): Promise<APIGatewayProxyResultV2> => {
  const contentType = response.headers.get('content-type');
  const isText = textTypes.some((type) => contentType?.startsWith(type));
  const body = await response.arrayBuffer();

  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers),
    body: Buffer.from(body).toString(isText ? 'utf8' : 'base64'),
    isBase64Encoded: !isText,
  };
};
