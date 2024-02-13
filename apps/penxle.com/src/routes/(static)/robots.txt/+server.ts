import { production } from '@penxle/lib/environment';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const lines = ['User-agent: *', 'Disallow: /api/', 'Disallow: /_internal/', 'Disallow: /_playground/'];

  if (production) {
    lines.push('Allow: /api/shortlink/');
  } else {
    lines.push('Disallow: /');
  }

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
};
