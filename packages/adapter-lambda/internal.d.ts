declare module 'SERVER' {
  export { Server } from '@sveltejs/kit';
}

declare module 'MANIFEST' {
  import { SSRManifest } from '@sveltejs/kit';

  export const manifest: SSRManifest;
  export const prerendered: Set<string>;
}

declare module 'HANDLER' {
  import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

  export const handler: APIGatewayProxyHandlerV2;
}
