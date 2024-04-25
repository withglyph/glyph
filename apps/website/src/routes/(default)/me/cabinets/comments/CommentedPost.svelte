<script lang="ts">
  import dayjs from 'dayjs';
  import { fragment, graphql } from '$glitch';
  import { Image } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { CommentedPost_postComment } from '$glitch';

  let _postComment: CommentedPost_postComment;
  export { _postComment as $postComment };

  $: postComment = fragment(
    _postComment,
    graphql(`
      fragment CommentedPost_postComment on PostComment {
        id
        content
        createdAt

        post {
          id
          permalink

          thumbnail {
            id
            ...Image_image
          }

          publishedRevision {
            id
            title
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
        }
      }
    `),
  );
</script>

<svelte:element
  this={$postComment.post ? 'a' : 'div'}
  class={flex({ direction: 'column', paddingY: '24px' })}
  href={$postComment.post ? `/${$postComment.post.space?.slug}/${$postComment.post.permalink}` : undefined}
>
  <time class={css({ fontSize: '13px', color: 'gray.500' })} datetime="$postComment.createdAt">
    {dayjs($postComment.createdAt).formatAsDateTime()}에 작성
  </time>
  <p
    class={css({
      marginTop: '6px',
      marginBottom: '10px',
      fontSize: '15px',
      fontWeight: 'semibold',
      lineClamp: '2',
      wordBreak: 'break-all',
      height: '44px',
    })}
  >
    {$postComment.content}
  </p>

  <div class={flex({ align: 'center', gap: '8px' })}>
    <Image
      style={css.raw({ flex: 'none', width: '50px', aspectRatio: '16/10' })}
      $image={$postComment.post?.thumbnail}
      placeholder
      size={64}
    />

    <div class={css({ truncate: true })}>
      <p
        class={css(
          { marginBottom: '2px', fontSize: '13px', color: 'gray.600', truncate: true },
          !$postComment.post && { color: 'gray.400' },
        )}
      >
        {$postComment.post ? $postComment.post?.publishedRevision?.title ?? '(제목 없음)' : '삭제된 포스트'}
      </p>
      <div class={flex({ align: 'center', gap: '4px', height: '24px', truncate: true })}>
        <Image
          style={css.raw({ flex: 'none', size: '18px' })}
          $image={$postComment.post?.space?.icon}
          placeholder
          size={24}
        />

        <p
          class={css(
            { fontSize: '12px', color: 'gray.600', truncate: true },
            !$postComment.post && { color: 'gray.400' },
          )}
        >
          {$postComment.post?.space?.name ?? '스페이스'}
        </p>
      </div>
    </div>
  </div>
</svelte:element>
