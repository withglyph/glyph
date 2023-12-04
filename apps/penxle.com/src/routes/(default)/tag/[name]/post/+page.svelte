<script lang="ts">
  import { graphql } from '$glitch';
  import { Feed } from '$lib/components';

  $: query = graphql(`
    query TagPostPage_Query($name: String!) {
      tag(name: $name) {
        id

        posts {
          id
          ...Feed_post
        }
      }
    }
  `);
</script>

{#each $query.tag.posts as post (post.id)}
  <Feed $post={post} showSpaceInfo />
{/each}
