<script lang="ts">
  import qs from 'query-string';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { Helmet, Pagination } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import CommentedPost from './CommentedPost.svelte';

  $: query = graphql(`
    query MeCabinetsCommentsPage_Query($page: Int! = 1) {
      auth(scope: USER)

      me @_required {
        id
        commentCount

        comments(page: $page) {
          id
          ...CommentedPost_postComment
        }
      }
    }
  `);

  let initialPage = Number($page.url.searchParams.get('page')) || 1;

  const updatePage = (currentPage: number) => {
    const stringifiedURL = qs.stringifyUrl({
      url: '/me/cabinets/comments',
      query: {
        page: currentPage,
      },
    });

    location.href = stringifiedURL;
  };
</script>

<Helmet description="댓글 단 포스트 목록을 둘러보세요" title="댓글 단 포스트" />

<p class={css({ paddingTop: '12px', paddingBottom: '10px', fontSize: '12px', color: 'gray.500' })}>
  총 {$query.me.commentCount}개의 댓글
</p>

<ul class={flex({ direction: 'column', flexGrow: '1' })}>
  {#each $query.me.comments as comment (comment.id)}
    <li
      class={css({
        borderTopWidth: '1px',
        borderTopColor: 'gray.100',
        _firstOfType: { 'borderStyle': 'none', '& > a': { paddingTop: '0' }, '& > div': { paddingTop: '0' } },
      })}
    >
      <CommentedPost $postComment={comment} />
    </li>
  {:else}
    <li class={css({ marginY: 'auto', paddingY: '60px', fontSize: '14px', color: 'gray.500', textAlign: 'center' })}>
      댓글을 남긴 포스트가 없어요
    </li>
  {/each}

  <Pagination
    style={css.raw({ marginTop: '60px', paddingBottom: '0' })}
    {initialPage}
    onChange={updatePage}
    totalItems={$query.me.commentCount}
  />
</ul>
