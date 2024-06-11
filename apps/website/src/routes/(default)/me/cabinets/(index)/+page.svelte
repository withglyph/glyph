<script lang="ts">
  import { graphql } from '$glitch';
  import { Helmet, Post } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

  $: query = graphql(`
    query MeCabinetsIndexPage_Query {
      auth(scope: USER)

      me @_required {
        id

        bookmarkGroups {
          id
          name
          postCount

          posts {
            id
            ...Feed_Post_post
          }
        }
      }

      ...Feed_Post_query
    }
  `);
</script>

<Helmet description="북마크한 포스트 목록을 둘러보세요" title="북마크한 포스트" />

<p class={css({ paddingTop: '12px', paddingBottom: '10px', fontSize: '12px', color: 'gray.500' })}>
  총 {$query.me.bookmarkGroups[0]?.postCount ?? 0}개의 포스트
</p>

<ul class={flex({ direction: 'column', flexGrow: '1' })}>
  {#each $query.me.bookmarkGroups[0]?.posts ?? [] as post (post.id)}
    <li
      class={css({
        borderTopWidth: '1px',
        borderTopColor: 'gray.50',
        _firstOfType: { 'borderStyle': 'none', '& > div > a': { paddingTop: '0' } },
      })}
    >
      <Post $post={post} {$query} showBookmark showDate showSpace />
    </li>
  {:else}
    <li class={css({ marginY: 'auto', paddingY: '60px', fontSize: '14px', color: 'gray.500', textAlign: 'center' })}>
      북마크한 포스트가 없어요
    </li>
  {/each}
</ul>
