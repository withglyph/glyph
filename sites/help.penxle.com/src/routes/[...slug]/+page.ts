import { error } from '@sveltejs/kit';
import type { ComponentType } from 'svelte';
import type { PageMeta } from '$lib/types';
import type { EntryGenerator, PageLoad } from './$types.js';

export const load = (async ({ params }) => {
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
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw error(404);
  }
}) satisfies PageLoad;

export const entries = (() => {
  const paths = Object.keys(import.meta.glob('$pages/**/*.md'));
  const slugs = paths.map((path) =>
    path.replaceAll(/(^\/src\/pages\/|\.md$)/g, ''),
  );

  return slugs.map((slug) => ({ slug }));
}) satisfies EntryGenerator;
