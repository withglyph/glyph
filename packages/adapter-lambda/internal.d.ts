declare module 'SERVER' {
  export { Server } from '@sveltejs/kit';
}

declare module 'MANIFEST' {
  import type { SSRManifest } from '@sveltejs/kit';

  export const manifest: SSRManifest;
  export const prerendered: Set<string>;
}

declare module 'HANDLER' {
  import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
  import type { Context } from './src/handler';

  export const createHandler: (ctx: Context) => APIGatewayProxyHandlerV2;
}
