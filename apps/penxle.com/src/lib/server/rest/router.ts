import { Router } from 'itty-router';
import type { Context } from '../context';

export const createRouter = () => Router<Request, [Context]>({ base: '/api' });
