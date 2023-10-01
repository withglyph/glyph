import type { PageLoadEvent } from './$types';

export const _SignupPage_QueryVariables = (event: PageLoadEvent) => ({
  token: event.url.searchParams.get('token'),
});
