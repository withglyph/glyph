<script lang="ts">
  import { graphql } from '$glitch';
  import { Feed, Tag } from '$lib/components';

  $: query = graphql(`
    query FeedFollowTagsPage_Query {
      tagFeed {
        id
        ...Feed_post
      }

      recentlyUsedTags {
        id
        name
      }
    }
  `);
</script>

{#if $query.tagFeed.length === 0}
  <div>
    <p class="body-15-b text-center">
      관심 태그가 추가되어있지 않아
      <br />
      목록을 불러올 수 없어요 관심 태그를 추가해보세요!
    </p>
    <div class="flex flex-wrap gap-3 mt-5">
      {#each $query.recentlyUsedTags.slice(0, 4) as tag (tag.id)}
        <Tag>#{tag.name}</Tag>
      {/each}
    </div>
  </div>
{/if}

{#each $query.tagFeed as post (post.id)}
  <Feed $post={post} showSpaceInfo />
{/each}
