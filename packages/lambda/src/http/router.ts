import { Router } from 'itty-router';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import type { IRequest } from 'itty-router';

type LambdaRequest = IRequest & { event: APIGatewayProxyEventV2 };
export const router = Router<LambdaRequest>();
