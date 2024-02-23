<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import PostCard from './PostCard.svelte';

  $: query = graphql(`
    query IndexPage_Query {
      me {
        id
      }

      recommendFeed {
        id
        ...Feed_PostCard_post
      }

      recentlyUsedTags {
        id
        name
      }
    }
  `);
</script>

<svelte:head>
  <meta name="naver-site-verification" content="b127529850b2cea3fde71eaf9c43d5b6cbb76d42" />
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "펜슬",
      "url": "https://pencil.co"
    }
  </script>
</svelte:head>

<Helmet
  description="펜슬은 누구나 창작자가 될 수 있는, 개인 창작자들을 위한 자유롭고 즐거운 창작 사이트예요. 펜슬에 1, 2차 창작물을 올리고, 다른 사람들의 창작 활동을 둘러보세요."
  image={{
    src: 'https://pnxl.net/assets/opengraph/default-cover.png',
    size: 'large',
  }}
  title="누구나 창작자가 되다, 펜슬"
  titleSuffix=""
/>

<div class="w-full bg-white grow px-16px py-32px">
  <div class="flex gap-32px w-full max-w-300 pb-16px mx-auto">
    <div class="grow sm:pr-100px">
      <div class="flex gap-16px text-18-sb">
        <div class="underline underline-4 underline-offset-8">추천</div>
        <a class="text-gray-300 hover:text-inherit" href="/feed/recent">최신</a>
        {#if $query.me}
          <a class="text-gray-300 hover:text-inherit" href="/feed/tags">관심 태그</a>
          <a class="text-gray-300 hover:text-inherit" href="/feed/spaces">관심 스페이스</a>
        {/if}
      </div>

      <div class="text-24-b pt-32px pb-2px">추천 포스트</div>
      <div class="text-14-m text-gray-500">펜슬에 올라오는 포스트들을 둘러보세요</div>

      <div class="mt-16px flex flex-col mt-32px gap-32px w-full">
        {#each $query.recommendFeed as post (post.id)}
          <div class="w-full grow border-b-1px border-gray-200" />
          <PostCard $post={post} />
        {/each}
      </div>
    </div>

    <div class="flex-none w-1px bg-gray-200 <sm:hidden" />

    <div class="flex-none flex flex-col gap-32px w-300px <sm:hidden">
      <div class="sticky top-100px">
        <div class="flex flex-col gap-8px">
          <div class="text-18-b">최근 사용된 태그</div>
          <div class="flex flex-wrap items-start gap-8px">
            {#each $query.recentlyUsedTags as tag (tag.id)}
              <a class="text-12-r text-gray-700 bg-gray-100 px-12px py-4px rounded-30px" href={`/tag/${tag.name}`}>
                #{tag.name}
              </a>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
