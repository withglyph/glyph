import { IttyRouter } from 'itty-router';
import type { IRequest } from 'itty-router';
import type { Context } from '../context';

export const createRouter = () => IttyRouter<IRequest, [Context]>({ base: '/api' });
