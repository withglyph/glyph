<script lang="ts">
  import { Helmet, Link } from '@penxle/ui';
  import { graphql } from '$glitch';
  import { Button, Feed, GridImage } from '$lib/components';
  import { TabContentItem, TabHead, TabHeadItem } from '$lib/components/tab';
  import FollowSpaceModal from './FollowSpaceModal.svelte';
  import FollowTagModal from './FollowTagModal.svelte';

  let followingSpaceOpen = false;
  let followingTagOpen = false;
  let scrollTopEl: HTMLButtonElement;

  $: query = graphql(`
    query MeCabinetsPage_Query {
      auth(scope: USER)

      me @_required {
        id

        followedSpaces {
          id
        }

        likedPosts {
          id
          ...Feed_post
        }

        recentlyViewedPosts {
          id
          ...Feed_post
        }

        purchasedPosts {
          id
          permalink

          ...Feed_post
        }

        followedTags {
          id
        }

        bookmarks {
          id
          postCount

          thumbnails {
            id
            ...Image_image
          }
        }

        ...MeCabinetsPage_FollowSpaceModal_user
        ...MeCabinetsPage_FollowTagModal_user
      }
    }
  `);

  let activeTabValue = 1;
</script>

<svelte:window
  on:scroll={({ currentTarget }) => {
    scrollTopEl.style.display = currentTarget.scrollY > 200 ? 'flex' : 'none';
  }}
/>

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
    <button class="flex flex-col center grow basis-0" type="button" on:click={() => (followingTagOpen = true)}>
      <div class="title-20-eb mb-2 sm:title-24-eb">{$query.me.followedTags.length}</div>
      <div class="body-13-m text-secondary sm:body-16-m">관심 태그</div>
    </button>
    <!-- <div class="flex flex-col center grow basis-0 border-l">
      <div class="title-20-eb mb-2 sm:title-24-eb">300</div>
      <div class="body-13-m text-secondary sm:body-16-m">관심 그룹</div>
    </div> -->
  </div>

  <div class="bg-white p-4 space-y-2 sm:(border border-secondary rounded-2xl px-8 pb-6 space-y-6)">
    <div class="w-full flex items-center justify-between">
      <div>
        <span class="subtitle-18-eb sm:title-20-b">북마크</span>
        <!-- <span class="subtitle-18-eb ml-2 text-secondary">7</span> -->
      </div>

      <!-- <i class="i-lc-chevron-down square-6" /> -->
    </div>

    {#if $query.me.bookmarks.length === 0 || $query.me.bookmarks[0].postCount === 0}
      <p class="body-15-b text-secondary text-center py-2">아직 북마크가 없어요</p>
    {:else}
      {#each $query.me.bookmarks as bookmark (bookmark.id)}
        <Link class="inline-block" href="/me/cabinets/bookmark">
          {#if bookmark.thumbnails.length > 0}
            <GridImage class="square-37 sm:square-42 rounded-lg border border-secondary" images={bookmark.thumbnails} />
          {:else}
            <div class="square-37 sm:square-42 rounded-lg border border-secondary center">
              <svg class="rounded-lg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect fill="#0c0a091a" height="24" width="24" />
                <path
                  d="M7.36 3.86c2.3 5.04.42 10.01-.1 11.36-.08.23-.13.36-.11.36a15.7 15.7 0 0 1 9.45 4.6l-1.58-2.74L13 14.07a1.1 1.1 0 1 1 .53-.35l3.53 6.11c-1.4-4.68.63-10.12.63-10.12-6.15-.67-10.33-5.85-10.33-5.85Z"
                  fill="#FAFAF9"
                />
              </svg>
            </div>
          {/if}
          <p class="body-15-b mt-2 mb-1">북마크</p>
          <p class="body-13-m text-secondary">{bookmark.postCount}개의 포스트</p>
        </Link>
      {/each}
    {/if}
  </div>

  <div class="bg-white py-4 sm:(border border-secondary rounded-2xl)">
    <p class="title-20-b px-4 sm:px-8">포스트 목록</p>

    <TabHead class="w-full px-4 mt-4 mb-6 sm:px-8" variant="secondary">
      <TabHeadItem id={1} {activeTabValue} on:click={() => (activeTabValue = 1)}>좋아요</TabHeadItem>
      <TabHeadItem id={2} {activeTabValue} on:click={() => (activeTabValue = 2)}>최근</TabHeadItem>
      <TabHeadItem id={3} {activeTabValue} on:click={() => (activeTabValue = 3)}>구매</TabHeadItem>
    </TabHead>

    <div class="sm:px-8">
      <TabContentItem id={1} {activeTabValue}>
        <ul class="space-y-11.5">
          {#each $query.me.likedPosts as post (post.id)}
            <li>
              <Feed $post={post} />
            </li>
          {/each}
        </ul>
      </TabContentItem>
      <TabContentItem id={2} {activeTabValue}>
        <ul class="space-y-11.5">
          {#each $query.me.recentlyViewedPosts as post (post.id)}
            <li>
              <Feed $post={post} />
            </li>
          {/each}
        </ul>
      </TabContentItem>
      <TabContentItem id={3} {activeTabValue}>
        <ul class="space-y-11.5">
          {#each $query.me.purchasedPosts as post (post.id)}
            <li>
              <Feed $post={post} purchasedPost={post.permalink} />
            </li>
          {/each}
        </ul>
      </TabContentItem>

      <div class="<sm:px-4">
        <Button class="w-full mt-6" size="xl">포스트 더보기</Button>
      </div>
    </div>
  </div>
</div>

<button
  bind:this={scrollTopEl}
  class="fixed right-6 bottom-6 square-12.5 rounded-full bg-alphagray-50 center hidden"
  type="button"
  on:click={() => {
    scrollTo({ top: 0, behavior: 'smooth' });
  }}
>
  <i class="i-lc-arrow-up square-5 text-darkprimary" />
</button>

<FollowSpaceModal $user={$query.me} bind:open={followingSpaceOpen} />
<FollowTagModal $user={$query.me} bind:open={followingTagOpen} />
