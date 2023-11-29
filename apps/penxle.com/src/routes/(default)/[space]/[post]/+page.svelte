<script lang="ts">
  import { onMount } from 'svelte';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import Post from '../Post.svelte';

  $: query = graphql(`
    query SpacePostPage_Query($permalink: String!) {
      me {
        id
      }

      post(permalink: $permalink) {
        id

        revision {
          id
          ...Post_postRevision
        }
      }

      ...Post_query
    }
  `);

  const updatePostView = graphql(`
    mutation SpacePostPage_UpdatePostView_Mutation($input: UpdatePostViewInput!) {
      updatePostView(input: $input)
    }
  `);

  onMount(async () => {
    mixpanel.track('post:view', { postId: $query.post.id });
    await updatePostView({ postId: $query.post.id });
  });
</script>

<Post $postRevision={$query.post.revision} {$query} />
