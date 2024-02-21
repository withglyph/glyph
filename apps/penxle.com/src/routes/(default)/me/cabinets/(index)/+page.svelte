<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import PostItem from '../PostItem.svelte';

  $: query = graphql(`
    query MeCabinetsIndexPage_Query {
      auth(scope: USER)

      me @_required {
        id

        likedPosts {
          id
          ...PostItem_post
        }
      }
    }
  `);
</script>

<Helmet description="좋아요한 포스트 목록을 둘러보세요" title="좋아요한 포스트" />

{#each $query.me.likedPosts as post (post.id)}
  <PostItem $post={post} />
{:else}
  <p class="text-secondary text-center body-16-m py-10">좋아요한 포스트가 없어요</p>
{/each}
