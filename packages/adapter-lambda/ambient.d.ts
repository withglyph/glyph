declare namespace App {
  import type { APIGatewayProxyEventV2 } from 'aws-lambda';

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  export interface Platform {
    event: APIGatewayProxyEventV2;
  }
}
