import { error } from 'itty-router';
import { createContext } from '../context';
import { createRouter } from './router';
import { email, healthz, identification, nolt, notification, opengraph, payment, shortlink, sso } from './routes';
import type { RequestEvent } from '@sveltejs/kit';

const router = createRouter();

router.all(
  '*',
  healthz.fetch,
  email.fetch,
  identification.fetch,
  nolt.fetch,
  notification.fetch,
  opengraph.fetch,
  payment.fetch,
  shortlink.fetch,
  sso.fetch,
  () => error(404),
);

export const handler = async (event: RequestEvent) => {
  const context = await createContext(event);
  return await router.fetch(event.request, context);
};
