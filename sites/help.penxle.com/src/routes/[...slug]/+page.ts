import { error } from '@sveltejs/kit';
import type { PageMeta } from '$lib/types';

export const load = async ({ params }) => {
  try {
    const post = await import(`$pages/${params.slug}.md`);

    return {
      content: post.default,
      meta: post.metadata as PageMeta,
    };
  } catch {
    throw error(404);
  }
};

export const entries = () => {
  const paths = Object.keys(import.meta.glob('$pages/**/*.md'));
  const slugs = paths.map((path) =>
    path.replaceAll(/(^\/src\/pages\/|\.md$)/g, ''),
  );

  return slugs.map((slug) => ({ slug }));
};
