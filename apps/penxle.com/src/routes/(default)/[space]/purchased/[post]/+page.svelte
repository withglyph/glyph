<script lang="ts">
  import { graphql } from '$glitch';
  import PostView from '../../PostView.svelte';

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

<PostView $postRevision={$query.post.purchasedRevision} {$query} />
