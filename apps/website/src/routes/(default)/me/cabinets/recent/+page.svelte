<script lang="ts">
  import { graphql } from '$glitch';
  import { Helmet } from '$lib/components';
  import { css } from '$styled-system/css';
  import PostItem from '../PostItem.svelte';

  $: query = graphql(`
    query MeCabinetsRecentPage_Query {
      auth(scope: USER)

      me @_required {
        id

        recentlyViewedPosts {
          id
          ...PostItem_post
        }
      }
    }
  `);
</script>

<Helmet description="최근 본 포스트 목록을 둘러보세요" title="최근 본 포스트" />

{#each $query.me.recentlyViewedPosts as post (post.id)}
  <PostItem $post={post} />
{:else}
  <p class={css({ paddingY: '40px', color: 'gray.500', textAlign: 'center', fontWeight: 'medium' })}>
    최근 본 포스트가 없어요
  </p>
{/each}
