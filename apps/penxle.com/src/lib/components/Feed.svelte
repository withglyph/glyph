<script lang="ts">
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import { fragment, graphql } from '$glitch';
  import { Avatar, Badge, Image, Tag } from '$lib/components';
  import { toast } from '$lib/notification';
  import type { Feed_post } from '$glitch';

  let _post: Feed_post;
  export { _post as $post };

  export let showSpaceInfoMessage = false;
  let _class: string | undefined = undefined;
  export { _class as class };

  $: post = fragment(
    _post,
    graphql(`
      fragment Feed_post on Post {
        id
        permalink
        blurred
        publishedAt

        publishedRevision @_required {
          id
          title
          previewText
          price

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

        bookmarkGroups {
          id
        }
      }
    `),
  );

  const bookmarkPost = graphql(`
    mutation Feed_BookmarkPost_Mutation($input: BookmarkPostInput!) {
      bookmarkPost(input: $input) {
        id

        bookmarkGroups {
          id
        }
      }
    }
  `);

  const unbookmarkPost = graphql(`
    mutation Feed_UnbookmarkPost_Mutation($input: UnbookmarkPostInput!) {
      unbookmarkPost(input: $input) {
        id

        bookmarkGroups {
          id
        }
      }
    }
  `);

  const toggleBookmark = async () => {
    if ($post.bookmarkGroups.length > 0) {
      await unbookmarkPost({ bookmarkId: $post.bookmarkGroups[0].id, postId: $post.id });
      toast.success('북마크에서 삭제했어요');
    } else {
      await bookmarkPost({ postId: $post.id });
      toast.success('북마크에 저장되었어요');
    }
  };
</script>

{#if showSpaceInfoMessage}
  <div class="mt-2 flex items-center gap-3 pl-6 pr-3 mb-4 sm:p-0">
    <a class="relative" href={`/${$post.space.slug}`}>
      <Image class="square-10.5 rounded-3.5" $image={$post.space.icon} />
      <Avatar
        class="square-6 absolute border border-bg-primary -right-1 -bottom-1 <sm:hidden"
        $profile={$post.member.profile}
      />
    </a>
    <a class="grow flex flex-col" href={`/${$post.space.slug}`}>
      <p class="mb-0.5 body-15-b sm:hidden">{$post.space.name} · {$post.member.profile.name}</p>

      <p class="mb-0.5 body-15-b <sm:hidden">
        {$post.member.profile.name}님이 {$post.space.name}에
        <!-- prettier-ignore -->
        {#if $post.publishedRevision.price}
          <mark class="text-blue-50">유료글</mark>을
        {/if}
        게시했어요
      </p>
      <time class="body-13-m text-secondary">{dayjs($post.publishedAt).fromNow()}</time>
    </a>
    <button type="button" on:click={toggleBookmark}>
      <i
        class={clsx(
          'square-5 color-brand-50',
          $post.bookmarkGroups.length > 0
            ? 'i-px-bookmark-fill color-brand-50'
            : 'i-px-bookmark-outline color-icon-primary',
        )}
      />
    </button>
    <button type="button">
      <i class="i-lc-more-vertical square-5 color-icon-primary" />
    </button>
  </div>
{/if}

<div
  class={clsx(
    'flex flex-col space-y-2 w-full bg-cardprimary sm:(border border-secondary rounded-2xl transition hover:(border-tertiary shadow-[0_4px_16px_0_rgba(0,0,0,0.25)]))',
    $post.publishedRevision.tags.length === 0 && showSpaceInfoMessage && 'pb-3 sm:pb-4',
    _class,
  )}
>
  <a class="pt-3 px-6 sm:pt-4" href={`/${$post.space.slug}/${$post.permalink}`}>
    <div class="flex gap-1 flex-wrap">
      {#if $post.publishedRevision.price}
        <Badge class="w-fit" color="purple">유료</Badge>
      {/if}
      {#if $post.blurred}
        <Badge class="w-fit" color="orange">트리거 주의</Badge>
      {/if}
    </div>
    <h2 class="title-20-b mt-1">{$post.publishedRevision.title}</h2>

    <div class="relative">
      <article
        class={clsx(
          'flex gap-xs justify-between rounded-lg <sm:(flex-wrap flex-col)',
          $post.blurred && 'select-none min-h-5.5rem',
        )}
      >
        <p class="grow body-14-m text-secondary break-all line-clamp-6 whitespace-pre-line">
          {$post.publishedRevision.previewText}
        </p>

        {#if $post.publishedRevision.croppedThumbnail}
          <Image
            class="square-30 rounded-md flex-none sm:aspect-square"
            $image={$post.publishedRevision.croppedThumbnail}
          />
        {/if}
      </article>

      {#if $post.blurred}
        <header
          class="p-4 rounded-3 absolute top-0 h-full w-full left-auto right-auto flex flex-col center gap-2.5 items-center color-gray-5 backdrop-blur-4px bg-alphagray-50"
          role="alert"
        >
          <i class="i-px-alert-triangle square-6 block" />
          <h2 class="body-13-b">이 글은 시청에 주의가 필요한 글이에요</h2>
        </header>
      {/if}
    </div>
  </a>

  {#if $post.publishedRevision.tags.length > 0}
    <div class={clsx('flex flex-wrap gap-1.5 px-6', showSpaceInfoMessage && 'pb-3 sm:pb-4')}>
      {#each $post.publishedRevision.tags.slice(0, 4) as tag (tag.id)}
        <Tag href={`tag/${tag.name}`} size="sm">#{tag.name}</Tag>
      {/each}
      {#if $post.publishedRevision.tags.length > 4}
        <Tag size="sm">+{$post.publishedRevision.tags.length - 4}개의 태그</Tag>
      {/if}
    </div>
  {/if}

  {#if !showSpaceInfoMessage}
    <a
      class="flex items-center pb-3 px-6 pt-4 space-x-3 truncate sm:pb-4"
      href={`/${$post.space.slug}/${$post.permalink}`}
    >
      <Image class="square-6 rounded-lg flex-none" $image={$post.space.icon} />
      <p class="body-15-sb grow truncate">{$post.space.name} · {$post.member.profile.name}</p>
      <time class="body-14-m text-secondary">{dayjs($post.publishedAt).fromNow()}</time>
    </a>
  {/if}
</div>
