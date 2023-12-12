<script lang="ts">
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

{#if $query.me.likedPosts?.length === 0}
  <p class="text-secondary text-center body-15-b py-10">아직 좋아요한 포스트가 없어요</p>
{/if}

{#each $query.me.likedPosts as post (post.id)}
  <PostItem $post={post} />
{/each}
