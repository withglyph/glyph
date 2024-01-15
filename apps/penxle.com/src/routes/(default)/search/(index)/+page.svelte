<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import mixpanel from 'mixpanel-browser';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { Image, PostCard, Tag } from '$lib/components';
  import { TabHead, TabHeadItem } from '$lib/components/tab';
  import { toast } from '$lib/notification';
  import LoginRequireModal from '../../LoginRequireModal.svelte';

  let loginRequireOpen = false;

  $: query = graphql(`
    query SearchPage_Query($query: String!) {
      me {
        id
      }

      searchPosts(query: $query) {
        count

        posts {
          id
          ...Feed_post
        }
      }

      searchSpaces(query: $query) {
        id
        slug
        name
        description
        followed

        icon {
          id
          ...Image_image
        }

        meAsMember {
          id
        }
      }

      searchTags(query: $query) {
        id
        name
      }
    }
  `);

  const followSpace = graphql(`
    mutation SearchPage_FollowSpace_Mutation($input: FollowSpaceInput!) {
      followSpace(input: $input) {
        id
        followed
      }
    }
  `);

  const unfollowSpace = graphql(`
    mutation SearchPage_UnfollowSpace_Mutation($input: UnfollowSpaceInput!) {
      unfollowSpace(input: $input) {
        id
        followed
      }
    }
  `);
</script>

<Helmet title="{$page.url.searchParams.get('q')} - 펜슬 검색결과" />

<div class="body-14-m text-secondary mt-3 <sm:m-l-4">
  약 {$query.searchPosts.count}개의 검색결과가 있어요!
</div>

<TabHead class="mt-9 mb-4 w-full <sm:(sticky top-61px z-1)" variant="secondary">
  <TabHeadItem id={0} pathname="/search">전체</TabHeadItem>
  <TabHeadItem id={1} pathname="/search/post">포스트</TabHeadItem>
  <TabHeadItem id={2} pathname="/search/space">스페이스</TabHeadItem>
  <TabHeadItem id={3} pathname="/search/tag">태그</TabHeadItem>
</TabHead>

<div class="my-9 flex gap-9 <sm:flex-col">
  <div class="grow w-50% <sm:(w-full px-4)">
    <svelte:element
      this={$query.searchSpaces.length === 0 ? 'h2' : 'a'}
      class="flex title-20-b mb-4 items-center"
      href={$query.searchSpaces.length === 0 ? undefined : `/search/space?q=${$page.url.searchParams.get('q')}`}
    >
      스페이스
      {#if $query.searchSpaces.length > 0}
        <i class="i-lc-chevron-right square-6 text-secondary" />
      {/if}
    </svelte:element>

    {#if $query.searchSpaces.length === 0}
      <div class="text-secondary body-15-b text-center flex center min-h-50">검색 결과가 없어요</div>
    {:else}
      <div class="space-y-3">
        {#each $query.searchSpaces.slice(0, 2) as space (space.id)}
          <div class="p-1 rounded-lg hover:bg-surface-primary flex items-center gap-4">
            <a href={`/${space.slug}`}>
              <Image class="square-15 rounded-5 border border-secondary" $image={space.icon} />
            </a>

            <a class="flex flex-col gap-1 grow truncate" href={`/${space.slug}`}>
              <p class="body-15-b whitespace-pre-line line-clamp-1 break-all">
                {space.name}
              </p>
              <p class="body-14-m text-secondary whitespace-pre-line line-clamp-2 break-all">
                {space.description ?? ''}
              </p>
            </a>

            {#if !space.meAsMember}
              {#if space.followed}
                <button
                  class="py-1.5 px-2 rounded-12 border border-secondary body-13-m flex items-center gap-1 shrink-0"
                  type="button"
                  on:click={async () => {
                    await unfollowSpace({ spaceId: space.id });
                    mixpanel.track('space:unfollow', { spaceId: space.id, via: 'search' });
                    toast.success('관심 스페이스 해제되었어요');
                  }}
                >
                  <i class="i-lc-check" />
                  관심
                </button>
              {:else}
                <button
                  class="py-1.5 px-2 rounded-12 bg-gray-90 text-gray-5 body-13-m flex items-center gap-1 shrink-0"
                  type="button"
                  on:click={async () => {
                    if (!$query.me) {
                      loginRequireOpen = true;
                      return;
                    }

                    await followSpace({ spaceId: space.id });
                    mixpanel.track('space:follow', { spaceId: space.id, via: 'search' });
                    toast.success('관심 스페이스로 등록되었어요');
                  }}
                >
                  <i class="i-lc-plus" />
                  관심
                </button>
              {/if}
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <div class="grow w-50% <sm:(w-full px-4)">
    <svelte:element
      this={$query.searchTags.length === 0 ? 'h2' : 'a'}
      class="flex title-20-b mb-4 items-center"
      href={$query.searchTags.length === 0 ? undefined : `/search/tag?q=${$page.url.searchParams.get('q')}`}
    >
      태그
      {#if $query.searchTags.length > 0}
        <i class="i-lc-chevron-right square-6 text-secondary" />
      {/if}
    </svelte:element>

    {#if $query.searchTags.length === 0}
      <div class="text-secondary body-15-b text-center flex center min-h-50">검색 결과가 없어요</div>
    {:else}
      <div class="flex flex-wrap gap-3">
        {#each $query.searchTags.slice(0, 6) as tag (tag.id)}
          <Tag href={`/tag/${tag.name}`} size="lg">#{tag.name}</Tag>
        {/each}
      </div>
    {/if}
  </div>
</div>

<div>
  <svelte:element
    this={$query.searchPosts.count === 0 ? 'h2' : 'a'}
    class="title-20-b <sm:px-4"
    href={$query.searchPosts.count === 0 ? undefined : `/search/post?q=${$page.url.searchParams.get('q')}`}
  >
    포스트
    {#if $query.searchPosts.count > 0}
      <i class="i-lc-chevron-right square-6 text-secondary" />
    {/if}
  </svelte:element>

  {#if $query.searchPosts.count === 0}
    <div class="text-secondary body-15-b text-center flex center min-h-50">검색 결과가 없어요</div>
  {:else}
    <div class="<sm:bg-primary">
      {#each $query.searchPosts.posts as post (post.id)}
        <PostCard class="mt-4" $post={post} />
      {/each}
    </div>
  {/if}
</div>

<LoginRequireModal bind:open={loginRequireOpen} />
