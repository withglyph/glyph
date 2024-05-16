<script lang="ts">
  import dayjs from 'dayjs';
  import IconFolder from '~icons/tabler/folder';
  import IconPhoto from '~icons/tabler/photo';
  import IconTextRecognition from '~icons/tabler/text-recognition';
  import { fragment, graphql } from '$glitch';
  import { Chip, Icon } from '$lib/components';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { DraftPost_post } from '$glitch';

  let _post: DraftPost_post;
  export { _post as $post };

  $: post = fragment(
    _post,
    graphql(`
      fragment DraftPost_post on Post {
        id
        permalink

        contentState {
          id
          title
          subtitle
          previewText
          characters
          files
          images
          updatedAt
        }
      }
    `),
  );
</script>

<a
  class={css({
    flex: 'none',
    padding: '14px',
    backgroundColor: 'gray.50',
    width: { base: '286px', sm: '448px' },
    height: { base: '138px', sm: '140px' },
  })}
  href="/editor/{$post.permalink}"
>
  <Chip style={css.raw({ color: 'gray.500', backgroundColor: 'gray.0', width: 'fit' })} variant="fill">
    임시저장 포스트
  </Chip>
  <h3
    class={css({
      marginTop: '6px',
      fontSize: { base: '14px', sm: '15px' },
      fontWeight: 'semibold',
      truncate: true,
    })}
  >
    {$post.contentState.title ?? '(제목 없음)'}
  </h3>
  <div class={flex({ align: 'center', fontSize: '13px', height: '19px', truncate: true })}>
    {#if $post.contentState.subtitle}
      <h4
        class={css(
          {
            fontWeight: 'medium',
            color: 'gray.800',
            truncate: true,
          },
          !!$post.contentState.previewText && {
            _after: {
              content: '""',
              display: 'block',
              marginX: '4px',
              width: '[0.8px]',
              height: '10px',
              backgroundColor: 'gray.500',
            },
          },
        )}
      >
        {$post.contentState.subtitle ?? ''}
      </h4>
    {/if}
    {#if $post.contentState.previewText}
      <p class={css({ color: 'gray.600', truncate: true })}>
        {$post.contentState.previewText}
      </p>
    {/if}
  </div>

  <div class={flex({ align: 'center', gap: '6px', marginTop: '6px' })}>
    <div class={flex({ align: 'center', gap: '2px', fontSize: '12px', fontWeight: 'medium', color: 'gray.500' })}>
      <Icon icon={IconTextRecognition} />
      <span>{comma($post.contentState.characters)}자</span>
    </div>
    {#if $post.contentState.images > 0}
      <div
        class={flex({
          align: 'center',
          gap: '2px',
          fontSize: '12px',
          fontWeight: 'medium',
          color: 'gray.500',
        })}
      >
        <Icon icon={IconPhoto} />
        <span>{comma($post.contentState.images)}장</span>
      </div>
    {/if}
    {#if $post.contentState.files > 0}
      <div
        class={flex({
          align: 'center',
          gap: '2px',
          fontSize: '12px',
          fontWeight: 'medium',
          color: 'gray.500',
        })}
      >
        <Icon icon={IconFolder} />
        <span>{comma($post.contentState.files)}개</span>
      </div>
    {/if}
  </div>

  <time
    class={css({ display: 'block', marginTop: '4px', fontSize: '11px', color: 'gray.400', textAlign: 'right' })}
    datetime={$post.contentState.updatedAt}
  >
    {dayjs($post.contentState.updatedAt).formatAsDateTime()}
  </time>
</a>
