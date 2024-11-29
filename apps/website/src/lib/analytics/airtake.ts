import Airtake from '@airtake/browser';
import { env } from '$env/dynamic/public';

export const setupAirtake = () => {
  Airtake.init({
    baseUrl: 'https://ingest.airtake.dev',
    token: env.PUBLIC_AIRTAKE_TOKEN,
  });
};
