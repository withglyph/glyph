<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import { Button, Feed } from '$lib/components';
  import { TabContentItem, TabHead, TabHeadItem } from '$lib/components/tab';
  import FollowSpaceModal from './FollowSpaceModal.svelte';

  let followingSpaceOpen = false;

  $: query = graphql(`
    query MeCabinetsPage_Query {
      auth(scope: USER)

      me @_required {
        id

        followedSpaces {
          id
        }

        recentlyViewedPosts {
          id
          ...Feed_post
        }

        ...MeCabinetsPage_FollowSpaceModal_user
      }
    }
  `);

  let activeTabValue = 1;
</script>

<Helmet title="나의 서랍" />

<h1 class="title-20-eb mb-6 <sm:hidden">나의 서랍</h1>

<div class="space-y-2 sm:space-y-6">
  <div class="bg-white flex py-3 sm:(border border-secondary rounded-2xl)">
    <button
      class="flex flex-col center grow basis-0 border-r"
      type="button"
      on:click={() => (followingSpaceOpen = true)}
    >
      <div class="title-20-eb mb-2 sm:title-24-eb">{$query.me.followedSpaces.length}</div>
      <div class="body-13-m text-secondary sm:body-16-m">관심 스페이스</div>
    </button>
    <div class="flex flex-col center grow basis-0">
      <div class="title-20-eb mb-2 sm:title-24-eb">29</div>
      <div class="body-13-m text-secondary sm:body-16-m">관심 태그</div>
    </div>
    <div class="flex flex-col center grow basis-0">
      <div class="title-20-eb mb-2 sm:title-24-eb">300</div>
      <div class="body-13-m text-secondary sm:body-16-m">관심 그룹</div>
    </div>
  </div>

  <div class="bg-white p-4 sm:(border border-secondary rounded-2xl px-8)">
    <button class="w-full flex items-center justify-between" type="button">
      <div>
        <span class="subtitle-18-eb sm:title-20-b">북마크</span>
        <span class="subtitle-18-eb ml-2 text-secondary">7</span>
      </div>

      <i class="i-lc-chevron-down square-6" />
    </button>
  </div>

  <div class="bg-white py-4 sm:(border border-secondary rounded-2xl)">
    <p class="title-20-b px-4 sm:px-8">포스트 목록</p>

    <TabHead class="w-full px-4 mt-4 mb-6 sticky top-15.25 bg-white z-10 sm:px-8" variant="secondary">
      <TabHeadItem id={1} {activeTabValue} variant="secondary" on:click={() => (activeTabValue = 1)}>
        좋아요
      </TabHeadItem>
      <TabHeadItem id={2} {activeTabValue} variant="secondary" on:click={() => (activeTabValue = 2)}>최근</TabHeadItem>
      <TabHeadItem id={3} {activeTabValue} variant="secondary" on:click={() => (activeTabValue = 3)}>구매</TabHeadItem>
    </TabHead>

    <div class="sm:px-8">
      <TabContentItem id={1} {activeTabValue}>좋아요</TabContentItem>
      <TabContentItem id={2} {activeTabValue}>
        <ul class="space-y-11.5">
          {#each $query.me.recentlyViewedPosts as post (post.id)}
            <li>
              <Feed $post={post} showSpaceInfo />
            </li>
          {/each}
        </ul>
      </TabContentItem>
      <TabContentItem id={3} {activeTabValue}>구매</TabContentItem>

      <Button class="w-full mt-6" size="xl">포스트 더보기</Button>
    </div>
  </div>
</div>

<FollowSpaceModal $user={$query.me} bind:open={followingSpaceOpen} />
