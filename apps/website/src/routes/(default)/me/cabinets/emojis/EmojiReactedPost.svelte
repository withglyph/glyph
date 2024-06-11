<script lang="ts">
  import dayjs from 'dayjs';
  import IconBookmark from '~icons/tabler/bookmark';
  import IconBookmarkFilled from '~icons/tabler/bookmark-filled';
  import IconEye from '~icons/tabler/eye';
  import IconMessageCircle from '~icons/tabler/message-circle';
  import IconMoodSmile from '~icons/tabler/mood-smile';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Chip, Icon, Image, LoginRequireAlert } from '$lib/components';
  import { humanizeNumber } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import type {
    MeCabinetsEmojisPage_EmojiReactedPost_post,
    MeCabinetsEmojisPage_EmojiReactedPost_query,
  } from '$glitch';
  import type { SystemStyleObject } from '$styled-system/types';

  let _post: MeCabinetsEmojisPage_EmojiReactedPost_post;
  let _query: MeCabinetsEmojisPage_EmojiReactedPost_query;
  export { _post as $post, _query as $query };

  export let style: SystemStyleObject | undefined = undefined;

  let loginRequireOpen = false;

  $: query = fragment(
    _query,
    graphql(`
      fragment MeCabinetsEmojisPage_EmojiReactedPost_query on Query {
        me {
          id
        }
      }
    `),
  );

  $: post = fragment(
    _post,
    graphql(`
      fragment MeCabinetsEmojisPage_EmojiReactedPost_post on Post {
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

        reactions {
          id
          emoji
          mine
        }

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
    mutation MeCabinetsEmojisPage_EmojiReactedPost_BookmarkPost_Mutation($input: BookmarkPostInput!) {
      bookmarkPost(input: $input) {
        id

        bookmarkGroups {
          id
        }
      }
    }
  `);

  const unbookmarkPost = graphql(`
    mutation MeCabinetsEmojisPage_EmojiReactedPost_UnbookmarkPost_Mutation($input: UnbookmarkPostInput!) {
      unbookmarkPost(input: $input) {
        id

        bookmarkGroups {
          id
        }
      }
    }
  `);
</script>

<div class={css({ position: 'relative' })}>
  <a
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
    href={`/${$post.space.slug}/${$post.permalink}`}
  >
    <div class={css({ flexGrow: '1', truncate: true })}>
      <div class={flex({ align: 'center', marginBottom: '2px' })}>
        <ul class={flex({ align: 'center' })}>
          {#each $post.reactions.slice(0, 8) as reaction (reaction.id)}
            {#if reaction.mine}
              <li class={center({ size: '15px' })}>
                <em-emoji
                  id={reaction.emoji}
                  class={center({ '& img': { display: '[block!]', size: '[13.5px]' } })}
                  set="twitter"
                />
              </li>
            {/if}
          {/each}
        </ul>
        {#if $post.reactions.filter((reaction) => reaction.mine).length > 8}
          <span class={css({ fontSize: '13px', color: 'gray.400' })}>
            ...+{$post.reactions.filter((reaction) => reaction.mine).length - 8}
          </span>
        {/if}
        <span class={css({ marginLeft: '4px', fontSize: '13px', color: 'gray.400' })}>남김</span>
      </div>
      <h3
        class={css({
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

      <div
        class={flex({
          align: 'center',
          gap: '4px',
          marginTop: { base: '12px', sm: '8px' },
          marginBottom: '4px',
          height: '24px',
          width: 'full',
          truncate: true,
        })}
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
      </div>

      <div
        class={css({
          display: 'flex',
          alignItems: 'center',
          color: 'gray.400',
          fontSize: '12px',
          height: '17px',
        })}
      >
        <time datetime={$post.publishedAt}>
          {dayjs($post.publishedAt).formatAsDate()}
        </time>

        <div
          class={css(
            { display: 'flex', alignItems: 'center', gap: '8px' },
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
      </div>
    </div>

    <div
      class={css({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
      })}
    >
      <div
        class={css({
          position: 'relative',
          flex: 'none',
          width: { base: '118px', sm: '144px' },
          aspectRatio: '16/10',
        })}
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
      </div>
    </div>
  </a>

  {#if $post.bookmarkGroups.length > 0}
    <button
      class={css({
        position: 'absolute',
        right: '0',
        bottom: '20px',
        zIndex: '1',
        marginTop: '8px',
      })}
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
        position: 'absolute',
        right: '0',
        bottom: '20px',
        zIndex: '1',
        marginTop: '8px',
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
</div>

<LoginRequireAlert bind:open={loginRequireOpen} />
