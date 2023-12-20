<script lang="ts">
  import { graphql } from '$glitch';
  import { PostCard } from '$lib/components';

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
  <PostCard $post={post} />
{/each}
