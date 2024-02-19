<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import PostCard from '../../PostCard.svelte';

  $: query = graphql(`
    query FeedTagsPage_Query {
      tagFeed {
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

<Helmet title="관심 태그 피드" />

<div class="w-full bg-white grow px-16px py-32px">
  <div class="flex gap-32px w-full max-w-300 pb-16px mx-auto">
    <div class="grow sm:pr-100px">
      <div class="flex gap-16px text-18-sb">
        <a class="text-gray-300 hover:text-inherit" href="/">추천</a>
        <a class="text-gray-300 hover:text-inherit" href="/feed/recent">최신</a>
        <div class="underline underline-4 underline-offset-8">관심 태그</div>
        <a class="text-gray-300 hover:text-inherit" href="/feed/spaces">관심 스페이스</a>
      </div>

      <div class="text-24-b pt-32px pb-2px">관심 태그</div>
      <div class="text-14-m text-gray-500">관심있는 태그의 최신 포스트를 둘러보세요</div>

      <div class="mt-16px flex flex-col mt-32px gap-32px w-full">
        {#each $query.tagFeed as post (post.id)}
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
