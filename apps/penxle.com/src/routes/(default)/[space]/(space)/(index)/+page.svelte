<script lang="ts">
  import { graphql } from '$glitch';
  import { Image, Tag } from '$lib/components';
  import TiptapRenderer from '$lib/tiptap/components/TiptapRenderer.svelte';

  $: query = graphql(`
    query SpacePage_Query($slug: String!) {
      space(slug: $slug) {
        id
        slug

        posts {
          id
          permalink
          createdAt

          revision {
            id
            title
            content

            thumbnail {
              id
              ...Image_image
            }
          }
        }
      }
    }
  `);
</script>

<article class="w-full max-w-50rem flex flex-col center py-9 gap-8 <sm:(p-0 gap-2 bg-surface-primary)">
  {#each $query.space.posts as post (post.id)}
    <a
      class="flex flex-col gap-2 w-full p-6 bg-cardprimary border-(secondary solid 1px) rounded-2xl <sm:(border-none rounded-none)"
      href={`${$query.space.slug}/${post.permalink}`}
    >
      <h2 class="title-20-eb">{post.revision.title}</h2>
      <article class="flex gap-xs justify-between <sm:flex-wrap <sm:flex-col">
        <TiptapRenderer
          class="flex-grow bodylong-16-m text-secondary overflow-hidden line-clamp-6"
          content={post.revision.content}
        />
        {#if post.revision.thumbnail}
          <Image class="h-11.25rem sm:aspect-square object-cover rounded-lg" $image={post.revision.thumbnail} />
        {/if}
      </article>
      <div>
        <Tag size="sm">#유료</Tag>
        <Tag size="sm">#소설</Tag>
        <Tag size="sm">#사이트</Tag>
      </div>
    </a>
  {/each}
</article>
