declare module '0SERVER' {
  export { Server } from '@sveltejs/kit';
}

declare module '0MANIFEST' {
  import { SSRManifest } from '@sveltejs/kit';

  export const manifest: SSRManifest;
  export const prerendered: Set<string>;
}

declare namespace App {
  import type { APIGatewayProxyEventV2 } from 'aws-lambda';

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  export interface Platform {
    event: APIGatewayProxyEventV2;
  }
}
