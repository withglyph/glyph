<script lang="ts">
  import clsx from 'clsx';
  import { graphql } from '$glitch';
  import { Image, Tag } from '$lib/components';

  $: query = graphql(`
    query SpacePage_Query($slug: String!) {
      space(slug: $slug) {
        id
        slug

        posts {
          id
          permalink
          createdAt
          blurred

          revision {
            id
            title
            previewText

            thumbnail {
              id

              image {
                id
                ...Image_image
              }
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
      <div class="relative">
        <article
          class={clsx(
            'flex gap-xs justify-between <sm:flex-wrap <sm:flex-col',
            post.blurred && 'filter-blur-4px bg-alphagray-50 select-none min-h-5.5rem',
          )}
        >
          <p class="bodylong-16-m">{post.revision.previewText}</p>
          {#if post.revision.thumbnail}
            <Image class="h-11.25rem sm:aspect-square object-cover rounded-lg" $image={post.revision.thumbnail.image} />
          {/if}
        </article>
        {#if post.blurred}
          <header
            class={clsx(
              'p-4 rounded-3 absolute top-0 w-full left-auto right-auto flex flex-col gap-0.625rem items-center color-gray-5',
            )}
            role="alert"
          >
            <i class="i-px-alert-triangle square-6 block" />
            <h2 class="body-13-b">이 글은 시청에 주의가 필요한 글이에요</h2>
          </header>
        {/if}
      </div>
      <div>
        <Tag size="sm">#유료</Tag>
        <Tag size="sm">#소설</Tag>
        <Tag size="sm">#사이트</Tag>
      </div>
    </a>
  {/each}
</article>
