<script lang="ts">
  import { Link } from '@penxle/ui';
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import { fragment, graphql } from '$glitch';
  import { Avatar, Image, Tag } from '$lib/components';
  import type { Feed_post } from '$glitch';

  let _post: Feed_post;
  export { _post as $post };

  export let showSpaceInfo = false;
  export let purchasedPost: string | undefined = undefined;

  $: post = fragment(
    _post,
    graphql(`
      fragment Feed_post on Post {
        id
        permalink
        blurred
        purchasedAt
        publishedAt

        publishedRevision @_required {
          id
          title
          previewText
          createdAt

          croppedThumbnail {
            id
            ...Image_image
          }

          tags {
            id
            name
          }
        }

        space {
          id
          slug
          name

          icon {
            id
            ...Image_image
          }
        }

        member {
          id

          profile {
            id
            name
            ...Avatar_profile
          }
        }
      }
    `),
  );
</script>

<div>
  {#if showSpaceInfo}
    <div class="mt-2 flex items-center gap-3 pl-6 pr-3 mb-4 sm:p-0">
      <div class="relative">
        <Image class="square-10.5 rounded-3.5" $image={$post.space.icon} />
        <Avatar
          class="square-6 absolute border border-bg-primary -right-1 -bottom-1 <sm:hidden"
          $profile={$post.member.profile}
        />
      </div>
      <div class="grow flex flex-col">
        <p class="mb-0.5 body-15-b sm:hidden">{$post.space.name} · {$post.member.profile.name}</p>

        <p class="mb-0.5 body-15-b <sm:hidden">
          {$post.member.profile.name}님이 {$post.space.name}에
          <mark class="text-purple-50">유료글</mark>
          을 게시했어요
        </p>
        {#if purchasedPost}
          <Link
            class="text-secondary body-13-m underline underline-offset-2 hover:text-gray-60"
            href={`/${$post.space.slug}/purchased/${purchasedPost}`}
          >
            {dayjs($post.purchasedAt).formatAsDate()}에 결제된 글 보기
          </Link>
        {:else}
          <time class="body-13-m text-secondary">{dayjs($post.publishedAt).formatAsDate()}</time>
        {/if}
      </div>
      <button type="button">
        <i class="i-lc-more-vertical square-6 text-secondary" />
      </button>
    </div>
  {/if}

  <div class="flex flex-col gap-2 w-full bg-cardprimary sm:(border border-secondary rounded-2xl)">
    <a class="pt-3 px-6 sm:pt-6" href={`/${$post.space.slug}/${$post.permalink}`}>
      <h2 class="title-20-eb">{$post.publishedRevision.title}</h2>

      <div class="relative">
        <article
          class={clsx(
            'flex gap-xs justify-between rounded-lg <sm:(flex-wrap flex-col)',
            $post.blurred && 'select-none min-h-5.5rem',
          )}
        >
          <p class="grow bodylong-16-m text-secondary break-all line-clamp-6 whitespace-pre-line">
            {$post.publishedRevision.previewText}
          </p>

          {#if $post.publishedRevision.croppedThumbnail}
            <Image
              class="h-11.25rem sm:aspect-square object-cover rounded-lg flex-none"
              $image={$post.publishedRevision.croppedThumbnail}
            />
          {/if}
        </article>

        {#if $post.blurred}
          <header
            class={clsx(
              'p-4 rounded-3 absolute top-0 h-full w-full left-auto right-auto flex flex-col center gap-2.5 items-center color-gray-5 backdrop-blur-4px bg-alphagray-50',
            )}
            role="alert"
          >
            <i class="i-px-alert-triangle square-6 block" />
            <h2 class="body-13-b">이 글은 시청에 주의가 필요한 글이에요</h2>
          </header>
        {/if}
      </div>
    </a>

    <div class="flex flex-wrap gap-1.5 pb-3 px-6 sm:pb-6">
      {#each $post.publishedRevision.tags.slice(0, 4) as tag (tag.id)}
        <Tag href={`tag/${tag.name}`} size="sm">#{tag.name}</Tag>
      {/each}
      {#if $post.publishedRevision.tags.length > 4}
        <Tag size="sm">+{$post.publishedRevision.tags.length - 4}개의 태그</Tag>
      {/if}
    </div>
  </div>
</div>
