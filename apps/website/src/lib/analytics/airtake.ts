import Airtake from '@airtake/browser';
import { env } from '$env/dynamic/public';

export const setupAirtake = () => {
  Airtake.init({
    token: env.PUBLIC_AIRTAKE_TOKEN,
  });
};
