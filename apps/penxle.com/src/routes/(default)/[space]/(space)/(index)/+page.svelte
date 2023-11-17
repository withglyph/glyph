<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import { Feed } from '$lib/components';

  $: query = graphql(`
    query SpacePage_Query($slug: String!) {
      space(slug: $slug) {
        id
        name

        posts {
          id

          ...Feed_post
        }
      }
    }
  `);
</script>

<Helmet title={`홈 | ${$query.space.name}`} />

<article class="w-full max-w-50rem flex flex-col center py-9 gap-8 grow <sm:(p-0 gap-2 bg-surface-primary)">
  {#each $query.space.posts as post (post.id)}
    <Feed $post={post} />
  {/each}
</article>
