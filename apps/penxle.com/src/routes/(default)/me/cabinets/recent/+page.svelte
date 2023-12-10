<script lang="ts">
  import { graphql } from '$glitch';
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

{#if $query.me.recentlyViewedPosts?.length === 0}
  <p class="text-secondary text-center body-15-b py-10">최근 본 포스트가 없어요</p>
{/if}

{#each $query.me.recentlyViewedPosts as post (post.id)}
  <PostItem $post={post} />
{/each}
