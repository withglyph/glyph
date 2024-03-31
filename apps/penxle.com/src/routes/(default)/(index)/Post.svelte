<script lang="ts">
  import IconEye from '~icons/tabler/eye';
  import IconMessageCircle from '~icons/tabler/message-circle';
  import IconMoodSmile from '~icons/tabler/mood-smile';
  import { fragment, graphql } from '$glitch';
  import { Chip, Icon, Tag } from '$lib/components';
  import Image from '$lib/components/Image.svelte';
  import { humanizeNumber } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { Feed_Post_post } from '$glitch';
  import type { SystemStyleObject } from '$styled-system/types';

  let _post: Feed_Post_post;
  export { _post as $post };

  export let style: SystemStyleObject | undefined = undefined;

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

        publishedRevision @_required {
          id
          title
          subtitle
          price
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
</script>

<a
  class={css(
    {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: { base: '24px', sm: '40px' },
      paddingY: '20px',
      truncate: true,
    },
    style,
  )}
  href={`/${$post.space.slug}/${$post.permalink}`}
>
  <div class={css({ truncate: true })}>
    <h3 class={css({ marginBottom: '2px', fontSize: '14px', fontWeight: 'semibold', truncate: true })}>
      {$post.publishedRevision.title ?? '(제목 없음)'}
    </h3>
    <h4 class={css({ fontSize: '13px', color: 'gray.600', height: '19px', truncate: true })}>
      {$post.publishedRevision.subtitle ?? ''}
    </h4>

    <div
      class={flex({
        align: 'center',
        gap: '4px',
        marginTop: '6px',
        marginBottom: '12px',
        height: '21px',
        truncate: true,
      })}
    >
      {#each $post.tags.slice(0, 2) as tag (tag.id)}
        <Tag
          style={css.raw({ maxWidth: { base: '62px', sm: '94px' }, truncate: true })}
          href={`/tag/${tag.tag.name}/post`}
          size="sm"
        >
          #{tag.tag.name}
        </Tag>
      {/each}
      {#if $post.tags.length > 2}
        <Tag style={css.raw({ maxWidth: { base: '62px', sm: '94px' }, truncate: true })} size="sm">
          +{$post.tags.length - 2}
        </Tag>
      {/if}
    </div>

    <div class={flex({ align: 'center', gap: '4px', marginY: '4px', height: '24px', width: 'full', truncate: true })}>
      <Image style={css.raw({ flex: 'none', size: '18px' })} $image={$post.space.icon} />

      <div
        class={css({
          fontSize: { base: '12px', sm: '13px' },
          color: 'gray.600',
          wordBreak: 'break-all',
          lineClamp: '1',
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
        gap: '6px',
        color: 'gray.400',
        fontSize: '12px',
        height: '17px',
      })}
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

  <div class={css({ position: 'relative', width: { base: '118px', sm: '144px' }, aspectRatio: '16/10' })}>
    {#if $post.thumbnail}
      <Image style={css.raw({ size: 'full', objectFit: 'cover' })} $image={$post.thumbnail} />
    {/if}

    <div class={css({ position: 'absolute', left: '6px', bottom: '6px', display: 'flex', gap: '4px' })}>
      {#if $post.publishedRevision.price}
        <Chip color="blue">유료</Chip>
      {/if}
      {#if $post.ageRating === 'R15'}
        <Chip color="pink">15세</Chip>
      {/if}
      {#if $post.ageRating === 'R19'}
        <Chip color="pink">성인</Chip>
      {/if}
      {#if $post.blurred && $post.ageRating === 'ALL'}
        <Chip color="violet">트리거</Chip>
      {/if}
    </div>
  </div>
</a>
