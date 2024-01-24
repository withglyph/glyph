import got from 'got';
import { env } from '$env/dynamic/private';

export const unfurl = async (url: string) => {
  const resp = await got({
    url: 'https://iframe.ly/api/oembed',
    method: 'GET',
    searchParams: {
      api_key: env.PRIVATE_IFRAMELY_API_KEY,
      url,
      omit_script: 1,
    },
  }).json<Record<string, string>>();

  if (resp.error) {
    throw new Error(resp.error);
  }

  return {
    type: resp.type,
    title: resp.title,
    description: resp.description,
    thumbnailUrl: resp.thumbnail_url,
    html: resp.html,
  };
};
