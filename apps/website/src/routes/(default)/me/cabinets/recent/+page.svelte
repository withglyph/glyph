<script lang="ts">
  import { graphql } from '$bifrost';
  import { Helmet } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import Post from '../../../(feed)/Post.svelte';

  $: query = graphql(`
    query MeCabinetsRecentPage_Query {
      auth(scope: USER)

      me @_required {
        id

        recentlyViewedPosts {
          id
          ...Feed_Post_post
        }
      }

      ...Feed_Post_query
    }
  `);
</script>

<Helmet description="최근 본 포스트 목록을 둘러보세요" title="최근 본 포스트" />

<p class={css({ paddingTop: '12px', paddingBottom: '10px', fontSize: '12px', color: 'gray.500' })}>
  총 {$query.me.recentlyViewedPosts.length}개의 포스트
</p>

<ul class={flex({ direction: 'column', flexGrow: '1' })}>
  {#each $query.me.recentlyViewedPosts as post (post.id)}
    <li
      class={css({
        borderTopWidth: '1px',
        borderTopColor: 'gray.100',
        _firstOfType: { 'borderStyle': 'none', '& > div > a': { paddingTop: '0' } },
      })}
    >
      <Post $post={post} {$query} showBookmark showDate showSpace />
    </li>
  {:else}
    <li class={css({ marginY: 'auto', paddingY: '60px', fontSize: '14px', color: 'gray.500', textAlign: 'center' })}>
      최근 본 포스트가 없어요
    </li>
  {/each}
</ul>
