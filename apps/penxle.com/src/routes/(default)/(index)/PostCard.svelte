<script lang="ts">
  import dayjs from 'dayjs';
  import IconEye from '~icons/tabler/eye';
  import IconHeart from '~icons/tabler/heart';
  import { fragment, graphql } from '$glitch';
  import { Avatar, Icon } from '$lib/components';
  import Image from '$lib/components/Image.svelte';
  import { humanizeNumber } from '$lib/utils';
  import { css } from '$styled-system/css';
  import type { Feed_PostCard_post } from '$glitch';

  let _post: Feed_PostCard_post;
  export { _post as $post };

  $: post = fragment(
    _post,
    graphql(`
      fragment Feed_PostCard_post on Post {
        id
        permalink
        ageRating
        likeCount
        viewCount
        publishedAt
        discloseStats

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

<a class={css({ display: 'flex', gap: '32px', minHeight: '150px' })} href={`/${$post.space.slug}/${$post.permalink}`}>
  <div class={css({ display: 'flex', flexDirection: 'column', flexGrow: '1' })}>
    <div class={css({ display: 'flex', alignItems: 'center', gap: '12px' })}>
      <div class={css({ position: 'relative', flex: 'none' })}>
        <Image
          style={css.raw({
            flex: 'none',
            size: '24px',
            borderWidth: '1px',
            borderColor: 'gray.200',
            borderRadius: '4px',
          })}
          $image={$post.space.icon}
        />
        <Avatar
          style={css.raw({
            position: 'absolute',
            flex: 'none',
            right: '-4px',
            bottom: '-4px',
            size: '16px',
            borderWidth: '1px',
            borderColor: 'gray.5',
          })}
          $profile={$post.member.profile}
        />
      </div>

      <div
        class={css({
          fontSize: '12px',
          fontWeight: 'medium',
          color: 'gray.500',
          wordBreak: 'break-all',
          lineClamp: '1',
        })}
      >
        {$post.space.name} · {$post.member.profile.name}
      </div>

      <div class={css({ width: '1px', height: '12px', backgroundColor: 'gray.200' })} />

      <div class={css({ flex: 'none', fontSize: '12px', fontWeight: 'medium', color: 'gray.400', hideBelow: 'sm' })}>
        {dayjs($post.publishedAt).fromNow()}
      </div>

      <div
        class={css({
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
          flex: 'none',
          flexGrow: 1,
          fontSize: '12px',
          fontWeight: 'medium',
          color: 'gray.400',
        })}
      >
        {#if $post.viewCount > 0 && $post.discloseStats}
          <div class={css({ display: 'flex', alignItems: 'center', gap: '2px' })}>
            <Icon style={css.raw({ size: '14px' })} icon={IconEye} />
            {humanizeNumber($post.viewCount)}
          </div>
        {/if}

        {#if $post.likeCount > 0 && $post.discloseStats}
          <div class={css({ display: 'flex', alignItems: 'center', gap: '2px' })}>
            <Icon style={css.raw({ size: '14px' })} icon={IconHeart} />
            {humanizeNumber($post.likeCount)}
          </div>
        {/if}

        {#if $post.ageRating === 'R15'}
          <div
            class={css({
              paddingX: '8px',
              paddingY: '2px',
              borderRadius: '4px',
              color: 'red.600',
              backgroundColor: 'red.200',
            })}
          >
            15세
          </div>
        {/if}

        {#if $post.ageRating === 'R19'}
          <div
            class={css({
              paddingX: '8px',
              paddingY: '2px',
              borderRadius: '4px',
              color: 'red.600',
              backgroundColor: 'red.200',
            })}
          >
            성인
          </div>
        {/if}
      </div>
    </div>

    <div class={css({ display: 'flex', flexDirection: 'column', marginTop: '12px' })}>
      <div
        class={css({
          fontSize: '18px',
          fontWeight: 'bold',
          lineHeight: 'none',
          wordBreak: 'break-all',
          lineClamp: '1',
        })}
      >
        {$post.publishedRevision.title ?? '(제목 없음)'}
      </div>
      {#if $post.publishedRevision.subtitle}
        <div
          class={css({
            marginTop: '8px',
            fontSize: '14px',
            fontWeight: 'medium',
            color: 'gray.500',
            lineHeight: 'none',
            wordBreak: 'break-all',
            lineClamp: '1',
          })}
        >
          {$post.publishedRevision.subtitle}
        </div>
      {/if}
      <div
        class={css({ marginTop: '12px', fontSize: '14px', color: 'gray.600', wordBreak: 'break-all', lineClamp: '2' })}
      >
        {$post.publishedRevision.previewText}
      </div>
    </div>

    {#if $post.tags.length > 0}
      <div
        class={css({
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          flexWrap: 'wrap',
          marginTop: '32px',
          height: '25px',
          overflow: 'hidden',
        })}
      >
        {#each $post.tags as { tag } (tag.id)}
          <div
            class={css({
              borderRadius: 'full',
              paddingX: '12px',
              paddingY: '4px',
              fontSize: '11px',
              color: 'gray.600',
              backgroundColor: 'gray.100',
            })}
          >
            #{tag.name}
          </div>
        {/each}
      </div>
    {/if}
  </div>

  {#if $post.thumbnail}
    <div class={css({ flex: 'none', borderRadius: '8px', size: '100px', overflow: 'hidden' })}>
      <Image style={css.raw({ size: 'full' })} $image={$post.thumbnail} />
    </div>
  {/if}
</a>
