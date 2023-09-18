import { error, json } from 'itty-router';
import { createContext } from '../context';
import { createRouter } from './router';
import { auth, healthz } from './routes';
import type { RequestEvent } from '@sveltejs/kit';
import type { TransactionClient } from '../database';

const router = createRouter();

router.all('*', auth.handle, healthz.handle, () => error(404));

export const handler = async (event: RequestEvent) => {
  let context;
  try {
    context = await createContext(event);
    const response = await router.handle(event.request, context);

    await (context.db as TransactionClient).$commit();
    return json(response);
  } catch (err) {
    if (context) {
      await (context.db as TransactionClient).$rollback();
    }

    console.error(err);
    return error(500);
  }
};
