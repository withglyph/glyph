<script lang="ts">
  import dayjs from 'dayjs';
  import Logo from '$assets/branding/logo-empty.svg?component';
  import { fragment, graphql } from '$glitch';
  import Image from '$lib/components/Image.svelte';
  import type { Feed_PostCard_post } from '$glitch';

  let _post: Feed_PostCard_post;
  export { _post as $post };

  $: post = fragment(
    _post,
    graphql(`
      fragment Feed_PostCard_post on Post {
        id
        permalink
        publishedAt

        publishedRevision @_required {
          id
          title
          subtitle
          previewText
        }

        space @_required {
          id
          slug
          name

          icon {
            id
            ...Image_image
          }
        }

        member @_required {
          id

          profile {
            id
            name

            avatar {
              id
              ...Image_image
            }
          }
        }

        thumbnail {
          id
          ...Image_image
        }

        tags {
          id
          tag {
            id
            name
          }
        }
      }
    `),
  );
</script>

<a class="group flex flex-col gap-8px" href={`/${$post.space.slug}/${$post.permalink}`}>
  <div class="flex-none w-full aspect-1/1 rounded-8px overflow-hidden">
    {#if $post.thumbnail}
      <Image class="square-full group-hover:scale-110 transition" $image={$post.thumbnail} />
    {:else}
      <!-- <div class="flex-none w-full aspect-1/1 bg-gray-100" /> -->
      <Logo class="square-full text-gray-100 group-hover:scale-110 transition" />
    {/if}
  </div>

  <div class="flex flex-col px-16px">
    <div class="text-16-b break-all line-clamp-1">
      {$post.publishedRevision.title ?? '(제목 없음)'}
    </div>
    {#if $post.publishedRevision.subtitle}
      <div class="text-14-m text-gray-500 break-all line-clamp-1">
        {$post.publishedRevision.subtitle}
      </div>
    {/if}
    <div class="text-14-r text-gray-500 mt-4px break-all line-clamp-2">
      {$post.publishedRevision.previewText}
    </div>
  </div>

  {#if $post.tags.length > 0}
    <div class="flex flex-wrap items-start gap-8px px-16px h-25px overflow-hidden">
      {#each $post.tags as { tag } (tag.id)}
        <div class="text-11-r text-gray-700 bg-gray-100 px-12px py-4px rounded-30px">
          #{tag.name}
        </div>
      {/each}
    </div>
  {/if}

  <div class="w-full grow border-b-1px border-gray-100" />

  <div class="flex flex-col px-16px pb-8px">
    <div class="flex items-center gap-8px">
      <Image class="flex-none square-16px rounded-4px" $image={$post.space.icon} />

      <div class="text-12-m text-gray-500 break-all truncate">
        {$post.member.profile.name}
      </div>
      <div class="w-1px h-12px bg-gray-200" />
      <div class="flex-none text-12-m text-gray-400">
        {dayjs($post.publishedAt).fromNow()}
      </div>
    </div>
  </div>
</a>
