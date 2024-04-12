<script lang="ts">
  import { graphql } from '$glitch';
  import { Helmet, PostCard } from '$lib/components';

  $: query = graphql(`
    query TagPage_Query($name: String!) {
      tag(name: $name) {
        id
        name

        posts(take: 1000) {
          id
          ...Feed_post
        }
      }
    }
  `);
</script>

<Helmet description={`글리프의 #${$query.tag.name} 태그`} title={`#${$query.tag.name}`} />

{#each $query.tag.posts as post (post.id)}
  <PostCard $post={post} />
{/each}
