<script lang="ts">
  import IconEye from '~icons/tabler/eye';
  import IconMessageCircle from '~icons/tabler/message-circle';
  import IconMoodSmile from '~icons/tabler/mood-smile';
  import { fragment, graphql } from '$glitch';
  import { Chip, Icon, Image, Tag } from '$lib/components';
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
  export let showStats = true;
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
        hasPassword

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

  type Variants = RecipeVariant<typeof recipe>;
  const recipe = sva({
    slots: ['title', 'subtitle', 'tag'],
    base: {
      title: {
        fontSize: { base: '14px', sm: '15px' },
        fontWeight: 'semibold',
        width: 'full',
        truncate: true,
      },
      subtitle: {
        flex: 'none',
        maxWidth: 'full',
        fontWeight: 'medium',
        truncate: true,
      },
      tag: { flex: 'none', truncate: true },
    },
    variants: {
      theme: {
        light: {
          title: {},
          subtitle: { color: 'gray.800' },
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

<div class={css({ display: 'block', truncate: true, flex: 'none' }, style)}>
  <a href="/{$post.space.slug}/{$post.permalink}">
    <div
      class={css(
        { position: 'relative', flex: 'none', marginBottom: '6px', aspectRatio: '16/10', overflow: 'hidden' },
        style,
      )}
    >
      <Image
        style={css.raw(
          {
            flex: 'none',
            borderWidth: '[0.8px]',
            borderColor: 'gray.100',
            size: 'full',
            aspectRatio: '16/10',
            objectFit: 'cover',
          },
          theme === 'dark' && { borderColor: 'gray.800' },
        )}
        $image={$post.thumbnail}
        placeholder
        size={512}
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

    <div class={flex({ flexDirection: 'column', align: 'flex-start', truncate: true })}>
      <h3 class={css(classes.title)}>
        {$post.publishedRevision.title ?? '(제목 없음)'}
      </h3>

      <div class={flex({ align: 'center', fontSize: '13px', width: 'full', height: '19px', truncate: true })}>
        {#if $post.publishedRevision.subtitle}
          <h4
            class={css(
              classes.subtitle,
              !!$post.publishedRevision.previewText && {
                _after: {
                  content: '""',
                  display: 'inline-block',
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
          <p class={css({ color: 'gray.600', truncate: true }, theme === 'dark' && { color: 'gray.400' })}>
            {$post.publishedRevision.previewText}
          </p>
        {/if}
      </div>
    </div>
  </a>

  {#if showTags}
    <div
      class={flex({
        align: 'center',
        gap: '4px',
        marginTop: '6px',
        marginBottom: '12px',
        height: '21px',
        overflowX: 'auto',
        scrollbar: 'hidden',
        truncate: true,
      })}
    >
      {#each $post.tags as tag (tag.id)}
        <Tag style={classes.tag} href="/tag/{tag.tag.name}" size="sm">
          #{tag.tag.name}
        </Tag>
      {/each}
    </div>
  {/if}

  {#if showSpace}
    <a
      class={flex({ align: 'center', gap: '4px', marginY: '4px', height: '24px', width: 'full', truncate: true })}
      href="/{$post.space.slug}"
    >
      <Image
        style={css.raw(
          { flex: 'none', borderWidth: '[0.8px]', borderColor: 'gray.100', size: '18px' },
          theme === 'dark' && { borderColor: 'gray.800' },
        )}
        $image={$post.space.icon}
        size={24}
      />

      <div
        class={css(
          {
            fontSize: '12px',
            fontWeight: 'medium',
            color: 'gray.500',
            wordBreak: 'break-all',
            width: 'full',
            truncate: true,
          },
          theme === 'dark' && { color: 'gray.400' },
        )}
      >
        {$post.space.name}
      </div>
    </a>
  {/if}

  {#if showStats}
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
  {/if}
</div>
