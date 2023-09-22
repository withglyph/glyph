import { error } from '@sveltejs/kit';
import type { ComponentType } from 'svelte';
import type { PageMeta } from '$lib/types';
import type { EntryGenerator, PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  try {
    const post = (await import(`$pages/${params.slug}.md`)) as {
      default: ComponentType;
      metadata: PageMeta;
    };

    return {
      content: post.default,
      meta: post.metadata,
    };
  } catch {
    throw error(404);
  }
};

export const entries: EntryGenerator = () => {
  const paths = Object.keys(import.meta.glob('$pages/**/*.md'));
  const slugs = paths.map((path) =>
    path.replaceAll(/(^\/src\/pages\/|\.md$)/g, ''),
  );

  return slugs.map((slug) => ({ slug }));
};
