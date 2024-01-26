import { create } from 'xmlbuilder2';
import { useCache } from '$lib/server/cache';
import { prismaClient } from '$lib/server/database';
import type { RequestHandler } from './$types';

const predefined = ['/'];

export const GET: RequestHandler = async (event) => {
  const paths = await useCache('sitemap.xml', async () => {
    const spaces = await prismaClient.space.findMany({
      select: { slug: true },
      where: {
        state: 'ACTIVE',
        visibility: 'PUBLIC',
      },
      orderBy: { id: 'asc' },
    });

    const posts = await prismaClient.post.findMany({
      select: { permalink: true, space: { select: { slug: true } } },
      where: {
        state: 'PUBLISHED',
        visibility: 'PUBLIC',
        password: null,
        space: { state: 'ACTIVE', visibility: 'PUBLIC' },
      },
      orderBy: { id: 'asc' },
    });

    return [
      ...predefined,
      ...spaces.map(({ slug }) => `/${slug}`),
      // Where의 posts.space 조건에 의해 space가 null일 수 없음
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ...posts.map(({ permalink, space }) => `/${space!.slug}/${permalink}`),
    ];
  });

  const doc = create({
    urlset: {
      '@xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
      'url': [paths.map((path) => ({ loc: `${event.url.origin}${path}` }))],
    },
  });

  return new Response(doc.end(), {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
