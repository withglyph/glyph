import { production } from '@withglyph/lib/environment';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const lines = ['User-agent: *', 'Disallow: /api/', 'Disallow: /_internal/', 'Disallow: /_playground/'];

  if (production) {
    lines.push('User-agent: Twitterbot', 'Allow: /api/shortlink/');
  } else {
    lines.push('Disallow: /');
  }

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
};
