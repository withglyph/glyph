<script lang="ts">
  import IconEye from '~icons/tabler/eye';
  import IconMessageCircle from '~icons/tabler/message-circle';
  import IconMoodSmile from '~icons/tabler/mood-smile';
  import { fragment, graphql } from '$glitch';
  import { Chip, Icon, Tag } from '$lib/components';
  import Image from '$lib/components/Image.svelte';
  import { humanizeNumber } from '$lib/utils';
  import { css, sva } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { Feed_PostCard_post } from '$glitch';
  import type { RecipeVariant, SystemStyleObject } from '$styled-system/types';

  let _post: Feed_PostCard_post;
  export { _post as $post };

  export let theme: Variants['theme'] = 'light';
  export let showSpace = true;
  export let showTags = false;
  export let style: SystemStyleObject | undefined = undefined;

  $: post = fragment(
    _post,
    graphql(`
      fragment Feed_PostCard_post on Post {
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

  type Variants = RecipeVariant<typeof recipe>;
  const recipe = sva({
    slots: ['title', 'subtitle', 'tag'],
    base: {
      title: {
        fontSize: { base: '14px', sm: '16px' },
        fontWeight: 'semibold',
        wordBreak: 'break-all',
        lineClamp: '1',
        truncate: true,
      },
      subtitle: {
        fontSize: { base: '13px', sm: '14px' },
        wordBreak: 'break-all',
        lineClamp: '1',
        height: '19px',
        truncate: true,
      },
      tag: { maxWidth: '94px', truncate: true },
    },
    variants: {
      theme: {
        light: {
          title: {},
          subtitle: { color: 'gray.600' },
          tag: {},
        },
        dark: {
          title: { color: 'gray.50' },
          subtitle: { color: 'gray.300' },
          tag: { backgroundColor: 'gray.800', color: 'gray.300' },
        },
      },
    },
  });

  $: classes = recipe.raw({ theme });
</script>

<a class={css({ display: 'block' }, style)} href={`/${$post.space.slug}/${$post.permalink}`}>
  <div
    class={css(
      { position: 'relative', flex: 'none', marginBottom: '6px', aspectRatio: '16/10', overflow: 'hidden' },
      style,
    )}
  >
    {#if $post.thumbnail}
      <Image style={css.raw({ size: 'full', aspectRatio: '16/10', objectFit: 'cover' })} $image={$post.thumbnail} />
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

  <div class={flex({ flexDirection: 'column', align: 'flex-start', truncate: true })}>
    <div class={css(classes.title)}>
      {$post.publishedRevision.title ?? '(제목 없음)'}
    </div>
    <div class={css(classes.subtitle)}>
      {$post.publishedRevision.subtitle ?? ''}
    </div>
  </div>

  {#if showTags}
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
        <Tag style={classes.tag} href={`/tag/${tag.tag.name}/post`} size="sm">#{tag.tag.name}</Tag>
      {/each}
      {#if $post.tags.length > 2}
        <Tag style={classes.tag} size="sm">+{$post.tags.length - 2}</Tag>
      {/if}
    </div>
  {/if}

  {#if showSpace}
    <div class={flex({ align: 'center', gap: '4px', marginY: '4px', height: '24px', width: 'full', truncate: true })}>
      <Image style={css.raw({ flex: 'none', size: '18px' })} $image={$post.space.icon} />

      <div
        class={css(
          {
            fontSize: '12px',
            fontWeight: 'medium',
            color: 'gray.500',
            wordBreak: 'break-all',
            lineClamp: '1',
            truncate: true,
          },
          theme === 'dark' && { color: 'gray.400' },
        )}
      >
        {$post.space.name}
      </div>
    </div>
  {/if}

  <div
    class={css(
      { display: 'flex', alignItems: 'center', gap: '6px', color: 'gray.400', fontSize: '12px', height: '17px' },
      theme === 'dark' && { color: 'gray.500' },
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
</a>
