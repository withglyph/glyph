<script lang="ts">
  import { graphql } from '$glitch';
  import PostCard from './PostCard.svelte';

  $: query = graphql(`
    query IndexPage_Query {
      recommendFeed {
        id
        ...Feed_PostCard_post
      }

      recentlyCreatedTags {
        id
        name
      }
    }
  `);
</script>

<div class="w-full bg-white grow px-16px py-32px">
  <div class="flex flex-col gap-32px justify-center w-full max-w-300 pb-16px mx-auto">
    <div>
      <div class="text-24-b pb-2px">최신 포스트</div>
      <div class="text-14-m text-gray-500">펜슬에 올라오는 최신 포스트를 둘러보세요</div>
    </div>

    <div class="flex flex-wrap items-start gap-8px">
      {#each $query.recentlyCreatedTags as tag (tag.id)}
        <div class="text-12-r text-gray-700 bg-gray-100 px-12px py-4px rounded-30px">
          #{tag.name}
        </div>
      {/each}
    </div>

    <div class="grid grid-cols-4 gap-32px w-full <sm:(grid-cols-2 gap-16px)">
      {#each $query.recommendFeed as post (post.id)}
        <PostCard $post={post} />
      {/each}
    </div>
  </div>
</div>
