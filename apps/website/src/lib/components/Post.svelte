<script lang="ts">
  import dayjs from 'dayjs';
  import IconBookmark from '~icons/tabler/bookmark';
  import IconBookmarkFilled from '~icons/tabler/bookmark-filled';
  import IconEye from '~icons/tabler/eye';
  import IconMessageCircle from '~icons/tabler/message-circle';
  import IconMoodSmile from '~icons/tabler/mood-smile';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { humanizeNumber } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import Chip from './Chip.svelte';
  import Icon from './Icon.svelte';
  import Image from './Image.svelte';
  import LoginRequireAlert from './LoginRequireAlert.svelte';
  import Tag from './Tag.svelte';
  import type { Feed_Post_post, Feed_Post_query } from '$glitch';
  import type { SystemStyleObject } from '$styled-system/types';

  let _post: Feed_Post_post;
  let _query: Feed_Post_query;
  export { _post as $post, _query as $query };

  export let showSpace = false;
  export let showBookmark = false;
  export let showDate = false;
  export let showStats = true;
  export let timeDisplay: 'relative' | 'absolute' = 'absolute';
  export let style: SystemStyleObject | undefined = undefined;

  let loginRequireOpen = false;

  $: query = fragment(
    _query,
    graphql(`
      fragment Feed_Post_query on Query {
        me {
          id
        }
      }
    `),
  );

  $: post = fragment(
    _post,
    graphql(`
      fragment Feed_Post_post on Post {
        id
        permalink
        ageRating
        reactionCount
        viewCount
        discloseStats
        commentCount
        blurred
        hasPassword
        publishedAt

        bookmarkGroups {
          id
        }

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

  const bookmarkPost = graphql(`
    mutation Feed_Post_BookmarkPost_Mutation($input: BookmarkPostInput!) {
      bookmarkPost(input: $input) {
        id

        bookmarkGroups {
          id
        }
      }
    }
  `);

  const unbookmarkPost = graphql(`
    mutation Feed_Post_UnbookmarkPost_Mutation($input: UnbookmarkPostInput!) {
      unbookmarkPost(input: $input) {
        id

        bookmarkGroups {
          id
        }
      }
    }
  `);
</script>

<div
  class={css(
    {
      display: 'flex',
      justifyContent: 'space-between',
      gap: { base: '20px', sm: '32px' },
      paddingY: '20px',
      truncate: true,
    },
    style,
  )}
>
  <div class={css({ flexGrow: '1', truncate: true })}>
    <a href={`/${$post.space.slug}/${$post.permalink}`}>
      <h3
        class={css({
          marginBottom: '2px',
          fontSize: { base: '14px', sm: '15px' },
          fontWeight: 'semibold',
          truncate: true,
        })}
      >
        {$post.publishedRevision.title ?? '(제목 없음)'}
      </h3>
      <div class={flex({ align: 'center', fontSize: '13px', height: '19px', truncate: true })}>
        {#if $post.publishedRevision.subtitle}
          <h4
            class={css(
              {
                display: 'flex',
                alignItems: 'center',
                flex: 'none',
                fontWeight: 'medium',
                color: 'gray.800',
                truncate: true,
              },
              !!$post.publishedRevision.previewText && {
                _after: {
                  content: '""',
                  display: 'block',
                  marginX: '4px',
                  width: '1px',
                  height: '10px',
                  backgroundColor: 'gray.500',
                },
              },
            )}
          >
            {$post.publishedRevision.subtitle ?? ''}
          </h4>
        {/if}
        {#if $post.publishedRevision.previewText}
          <p class={css({ color: 'gray.600', truncate: true })}>{$post.publishedRevision.previewText}</p>
        {/if}
      </div>
    </a>

    <div
      class={flex({
        align: 'center',
        gap: '4px',
        marginY: '6px',
        height: '21px',
        overflowX: 'auto',
        scrollbar: 'hidden',
        truncate: true,
      })}
    >
      {#each $post.tags as tag (tag.id)}
        <Tag style={css.raw({ flex: 'none', truncate: true })} href="/tag/{tag.tag.name}" size="sm">
          #{tag.tag.name}
        </Tag>
      {/each}
    </div>

    {#if showSpace}
      <a
        class={flex({ align: 'center', gap: '4px', marginY: '4px', height: '24px', width: 'fit', truncate: true })}
        href="/{$post.space.slug}"
      >
        <Image
          style={css.raw({ flex: 'none', borderWidth: '[0.8px]', borderColor: 'gray.100', size: '18px' })}
          $image={$post.space.icon}
          size={24}
        />

        <div
          class={css({
            fontSize: { base: '12px', sm: '13px' },
            color: 'gray.600',
            wordBreak: 'break-all',
            truncate: true,
          })}
        >
          {$post.space.name}
        </div>
      </a>
    {/if}

    {#if showDate || showStats}
      <div
        class={css({
          display: 'flex',
          alignItems: 'center',
          color: 'gray.400',
          fontSize: '12px',
          height: '17px',
        })}
      >
        {#if showDate}
          <time datetime={$post.publishedAt}>
            {timeDisplay === 'relative' ? dayjs($post.publishedAt).fromNow() : dayjs($post.publishedAt).formatAsDate()}
          </time>
        {/if}

        {#if showStats}
          <div
            class={css(
              { display: 'flex', alignItems: 'center', gap: '8px' },
              showDate &&
                $post.discloseStats && {
                  _before: {
                    content: '""',
                    display: 'block',
                    width: '1px',
                    height: '12px',
                    backgroundColor: 'gray.100',
                    marginLeft: '8px',
                    marginRight: '-2px',
                  },
                },
            )}
          >
            {#if $post.viewCount > 0 && $post.discloseStats}
              <div class={flex({ align: 'center', gap: '2px' })}>
                <Icon icon={IconEye} />
                {humanizeNumber($post.viewCount)}
              </div>
            {/if}

            {#if $post.reactionCount > 0 && $post.discloseStats}
              <div class={flex({ align: 'center', gap: '2px' })}>
                <Icon icon={IconMoodSmile} />
                {humanizeNumber($post.reactionCount)}
              </div>
            {/if}

            {#if $post.commentCount > 0 && $post.discloseStats}
              <div class={flex({ align: 'center', gap: '2px' })}>
                <Icon icon={IconMessageCircle} />
                {humanizeNumber($post.commentCount)}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <div
    class={css({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    })}
  >
    <a
      class={css({
        position: 'relative',
        flex: 'none',
        width: { base: '118px', sm: '144px' },
        aspectRatio: '16/10',
      })}
      href={`/${$post.space.slug}/${$post.permalink}`}
    >
      <Image
        style={css.raw({
          flex: 'none',
          borderWidth: '[0.8px]',
          borderColor: 'gray.100',
          size: 'full',
          aspectRatio: '16/10',
          objectFit: 'cover',
        })}
        $image={$post.thumbnail}
        placeholder
        size={256}
      />

      <div class={css({ position: 'absolute', left: '6px', bottom: '6px', display: 'flex', gap: '4px' })}>
        {#if $post.ageRating === 'R15'}
          <Chip color="pink">15세</Chip>
        {/if}
        {#if $post.ageRating === 'R19'}
          <Chip color="pink">성인</Chip>
        {/if}
        {#if $post.hasPassword}
          <Chip color="gray">비밀글</Chip>
        {/if}
      </div>
    </a>

    {#if showBookmark}
      {#if $post.bookmarkGroups.length > 0}
        <button
          type="button"
          on:click={async () => {
            await unbookmarkPost({ bookmarkGroupId: $post.bookmarkGroups[0].id, postId: $post.id });
            mixpanel.track('post:unbookmark', { postId: $post.id, via: 'feed' });
          }}
        >
          <Icon style={css.raw({ color: 'gray.900' })} icon={IconBookmarkFilled} size={20} />
        </button>
      {:else}
        <button
          class={css({
            _supportHover: {
              '& path': {
                fill: 'gray.900',
                stroke: 'gray.900',
              },
            },
          })}
          type="button"
          on:click={async () => {
            if (!$query.me) {
              loginRequireOpen = true;
              return;
            }

            await bookmarkPost({ postId: $post.id });
            mixpanel.track('post:bookmark', { postId: $post.id, via: 'feed' });
          }}
        >
          <Icon style={css.raw({ color: 'gray.400' })} icon={IconBookmark} size={20} />
        </button>
      {/if}
    {/if}
  </div>
</div>

<LoginRequireAlert bind:open={loginRequireOpen} />
