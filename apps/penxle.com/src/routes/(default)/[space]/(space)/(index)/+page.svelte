<script lang="ts">
  import { graphql } from '$glitch';
  import { Feed } from '$lib/components';

  $: query = graphql(`
    query SpacePage_Query($slug: String!) {
      space(slug: $slug) {
        id

        posts {
          id

          ...Feed_post
        }
      }
    }
  `);
</script>

<article class="w-full max-w-50rem flex flex-col center py-9 gap-8 grow <sm:(p-0 gap-2 bg-surface-primary)">
  {#each $query.space.posts as post (post.id)}
    <Feed $post={post} />
  {/each}
</article>
