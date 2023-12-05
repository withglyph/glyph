<script lang="ts">
  import { graphql } from '$glitch';
  import Post from '../../Post.svelte';

  $: query = graphql(`
    query SpacePurchasedPostPage_Query($permalink: String!) {
      post(permalink: $permalink) {
        id

        purchasedRevision @_required {
          id
          ...Post_postRevision
        }
      }

      ...Post_query
    }
  `);
</script>

<Post $postRevision={$query.post.purchasedRevision} {$query} />
