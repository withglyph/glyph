import { Router } from 'itty-router';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import type { IRequest } from 'itty-router';

export type LambdaRequest = IRequest & { __LAMBDA__: true };
export const router = Router<LambdaRequest, [APIGatewayProxyEventV2]>();
