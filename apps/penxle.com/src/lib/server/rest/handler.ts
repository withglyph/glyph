import { error, json } from 'itty-router';
import { createContext } from '../context';
import { createRouter } from './router';
import { auth } from './routes';
import type { RequestEvent } from '@sveltejs/kit';

const router = createRouter();

router.all('*', auth.handle).all('*', () => error(404));

export const handler = async (event: RequestEvent) => {
  try {
    const context = await createContext(event);
    const response = await router.handle(event.request, context);
    return json(response);
  } catch (err) {
    console.error(err);
    return error(500);
  }
};
