<script lang="ts">
  import { graphql } from '$glitch';

  $: query = graphql(`
    query SpacePage_Query($slug: String!) {
      space(slug: $slug) {
        id
        slug
        posts {
          id
          permalink
          option {
            id
            visibility
          }
          revision {
            id
            title
          }
          createdAt
        }
      }
    }
  `);
</script>

<div class="w-full flex flex-col center space-y-6 py-9">
  {#each $query.space.posts as post (post.id)}
    <div class="p-6 border border-secondary rounded-2xl bg-cardprimary w-full max-w-200">
      <a href={`${$query.space.slug}/${post.permalink}`}>
        <h3 class="title-20-eb">{post.revision.title}</h3>
      </a>
    </div>
  {/each}
</div>
