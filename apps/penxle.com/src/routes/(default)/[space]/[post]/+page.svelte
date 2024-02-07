<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
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

        space {
          id
          slug
        }

        publishedRevision @_required {
          id
          ...Post_postRevision
        }
      }

      ...Post_query
    }
  `);

  const updatePostView = graphql(`
    mutation SpacePostPage_UpdatePostView_Mutation($input: UpdatePostViewInput!) {
      updatePostView(input: $input) {
        id
        viewCount
      }
    }
  `);

  onMount(async () => {
    mixpanel.track('post:view', { postId: $query.post.id });
    await updatePostView({ postId: $query.post.id });
  });

  $: if ($query.post.space?.slug && $query.post.space?.slug !== $page.params.space && browser) {
    const url = new URL(location.href);
    url.pathname = `/${$query.post.space.slug}/${$page.params.post}`;
    goto(url, { replaceState: true });
  }
</script>

<Post $postRevision={$query.post.publishedRevision} {$query} />
