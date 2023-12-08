import * as Sentry from '@sentry/sveltekit';
import { error } from 'itty-router';
import { createContext } from '../context';
import { createRouter } from './router';
import { email, frill, healthz, identification, payment, shortlink, sso } from './routes';
import type { RequestEvent } from '@sveltejs/kit';

const router = createRouter();

router.all(
  '*',
  healthz.handle,
  email.handle,
  frill.handle,
  identification.handle,
  payment.handle,
  shortlink.handle,
  sso.handle,
  () => error(404),
);

export const handler = async (event: RequestEvent) => {
  let context;
  try {
    context = await createContext(event);
    const response = await router.handle(event.request, context);

    await context.$commit();
    return response;
  } catch (err) {
    if (context) {
      await context.$rollback();
    }

    console.error(err);
    Sentry.captureException(err);

    return error(500, String(err));
  }
};
