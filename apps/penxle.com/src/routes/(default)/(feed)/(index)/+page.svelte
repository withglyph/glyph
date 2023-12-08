<script lang="ts">
  import { graphql } from '$glitch';
  import { Feed } from '$lib/components';

  $: query = graphql(`
    query FeedIndexPage_Query {
      recommendFeed {
        id
        ...Feed_post
      }
    }
  `);
</script>

{#each $query.recommendFeed as post (post.id)}
  <Feed $post={post} showSpaceInfo />
{/each}
