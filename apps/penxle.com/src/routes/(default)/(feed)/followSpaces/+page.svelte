<script lang="ts">
  import { graphql } from '$glitch';
  import { Feed } from '$lib/components';

  $: query = graphql(`
    query FeedFollowSpacesPage_Query {
      spaceFeed {
        id
        ...Feed_post
      }
    }
  `);
</script>

{#if $query.spaceFeed.length === 0}
  <div class="flex flex-col center grow max-h-120">
    <p class="body-15-b text-center">
      관심 스페이스가 없어요
      <br />
      가장 먼저 펜슬 관심 스페이스를 추가 해보세요!
    </p>
  </div>
{/if}

{#each $query.spaceFeed as post (post.id)}
  <Feed class="mb-8" $post={post} showSpaceInfoMessage />
{/each}
