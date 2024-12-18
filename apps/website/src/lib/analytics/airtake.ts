import { Airtake } from '@airtake/browser';
import { env } from '$env/dynamic/public';

export const airtake = Airtake.init({
  token: env.PUBLIC_AIRTAKE_TOKEN,
});
