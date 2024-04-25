<script lang="ts">
  import dayjs from 'dayjs';
  import { fragment, graphql } from '$glitch';
  import { Chip, Image } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { MeCabinetsPurchasedPage_PurchasedPost_post } from '$glitch';
  import type { SystemStyleObject } from '$styled-system/types';

  let _post: MeCabinetsPurchasedPage_PurchasedPost_post;
  export { _post as $post };

  export let style: SystemStyleObject | undefined = undefined;

  $: post = fragment(
    _post,
    graphql(`
      fragment MeCabinetsPurchasedPage_PurchasedPost_post on Post {
        id
        permalink
        ageRating
        hasPassword
        purchasedAt

        purchasedRevision {
          id
          title
          subtitle
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
      }
    `),
  );
</script>

<a
  class={css(
    {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: { base: '20px', sm: '32px' },
      paddingY: '20px',
      truncate: true,
    },
    style,
  )}
  href="/{$post.space.slug}/purchased/{$post.permalink}"
>
  <div class={css({ flexGrow: '1', truncate: true })}>
    <time class={css({ marginBottom: '4px', fontSize: '13px', color: 'gray.400' })} datetime={$post.purchasedAt}>
      {dayjs($post.purchasedAt).formatAsDateTime()} 구매
    </time>
    <h3
      class={css({
        fontSize: { base: '14px', sm: '15px' },
        fontWeight: 'semibold',
        truncate: true,
      })}
    >
      {$post.purchasedRevision?.title ?? '(제목 없음)'}
    </h3>
    <h4
      class={css({
        fontSize: '13px',
        fontWeight: 'medium',
        color: 'gray.600',
        height: '19px',
        truncate: true,
      })}
    >
      {$post.purchasedRevision?.subtitle ?? ''}
    </h4>

    <div class={flex({ align: 'center', gap: '4px', marginTop: '6px', height: '24px', width: 'full', truncate: true })}>
      <Image
        style={css.raw({ flex: 'none', borderWidth: '[0.8px]', borderColor: 'gray.100', size: '18px' })}
        $image={$post.space.icon}
        size={24}
      />

      <div
        class={css({
          fontSize: '12px',
          color: 'gray.600',
          wordBreak: 'break-all',
          truncate: true,
        })}
      >
        {$post.space.name}
      </div>
    </div>
  </div>

  <div
    class={css({
      position: 'relative',
      flex: 'none',
      width: { base: '100px', sm: '160px' },
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
</a>
