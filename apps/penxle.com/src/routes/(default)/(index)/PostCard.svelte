<script lang="ts">
  import dayjs from 'dayjs';
  import { fragment, graphql } from '$glitch';
  import { Avatar } from '$lib/components';
  import Image from '$lib/components/Image.svelte';
  import { calcurateReadingTime, humanizeNumber } from '$lib/utils';
  import type { Feed_PostCard_post } from '$glitch';

  let _post: Feed_PostCard_post;
  export { _post as $post };

  $: post = fragment(
    _post,
    graphql(`
      fragment Feed_PostCard_post on Post {
        id
        permalink
        likeCount
        viewCount
        publishedAt

        publishedRevision @_required {
          id
          title
          subtitle
          previewText
          characterCount
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
            ...Avatar_profile
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

<a class="flex gap-32px min-h-150px" href={`/${$post.space.slug}/${$post.permalink}`}>
  <div class="flex flex-col grow">
    <div class="flex items-center gap-12px">
      <div class="relative">
        <Image class="square-24px rounded-4px border" $image={$post.space.icon} />
        <Avatar
          class="square-16px absolute border border-white -right-4px -bottom-4px"
          $profile={$post.member.profile}
        />
      </div>

      <div class="text-12-m text-gray-500 break-all line-clamp-1">
        {$post.space.name} · {$post.member.profile.name}
      </div>

      <div class="w-1px h-12px bg-gray-200" />

      <div class="flex-none text-12-m text-gray-400">
        {dayjs($post.publishedAt).fromNow()}
      </div>

      <div class="flex flex-none grow justify-end gap-8px text-12-m text-gray-400">
        {#if $post.viewCount > 0}
          <div class="flex items-center gap-2px">
            <i class="i-tb-eye square-14px" />
            {humanizeNumber($post.viewCount)}
          </div>
        {/if}

        {#if $post.likeCount > 0}
          <div class="flex items-center gap-2px">
            <i class="i-tb-heart square-14px" />
            {humanizeNumber($post.likeCount)}
          </div>
        {/if}

        {#if $post.publishedRevision.characterCount > 0}
          <div class="flex items-center gap-2px">
            <i class="i-tb-clock-hour-4 square-14px" />
            {calcurateReadingTime($post.publishedRevision.characterCount)}분
          </div>
        {/if}
      </div>
    </div>

    <div class="flex flex-col mt-12px">
      <div class="text-18-b break-all leading-none line-clamp-1">
        {$post.publishedRevision.title ?? '(제목 없음)'}
      </div>
      {#if $post.publishedRevision.subtitle}
        <div class="text-14-m text-gray-500 mt-8px leading-none break-all line-clamp-1">
          {$post.publishedRevision.subtitle}
        </div>
      {/if}
      <div class="text-14-r text-gray-700 mt-12px break-all line-clamp-2">
        {$post.publishedRevision.previewText}
      </div>
    </div>

    {#if $post.tags.length > 0}
      <div class="flex flex-wrap items-start gap-8px mt-32px h-25px overflow-hidden">
        {#each $post.tags as { tag } (tag.id)}
          <div class="text-11-r text-gray-700 bg-gray-100 px-12px py-4px rounded-30px">
            #{tag.name}
          </div>
        {/each}
      </div>
    {/if}
  </div>

  {#if $post.thumbnail}
    <div class="flex-none square-100px rounded-8px overflow-hidden">
      <Image class="square-full group-hover:scale-110 transition" $image={$post.thumbnail} />
    </div>
  {/if}
</a>
