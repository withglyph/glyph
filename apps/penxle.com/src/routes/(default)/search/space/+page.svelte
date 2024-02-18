<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import mixpanel from 'mixpanel-browser';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { Image } from '$lib/components';
  import { TabHead, TabHeadItem } from '$lib/components/tab';
  import { toast } from '$lib/notification';
  import LoginRequireModal from '../../LoginRequireModal.svelte';

  let loginRequireOpen = false;

  $: query = graphql(`
    query SearchSpacePage_Query($query: String!) {
      me {
        id
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
    }
  `);

  const followSpace = graphql(`
    mutation SearchSpacePage_FollowSpace_Mutation($input: FollowSpaceInput!) {
      followSpace(input: $input) {
        id
        followed
      }
    }
  `);

  const unfollowSpace = graphql(`
    mutation SearchSpacePage_UnfollowSpace_Mutation($input: UnfollowSpaceInput!) {
      unfollowSpace(input: $input) {
        id
        followed
      }
    }
  `);

  $: search = `?q=${$page.url.searchParams.get('q')}`;
</script>

<Helmet title={$page.url.searchParams.get('q') ?? ''} />

<div class="body-14-m text-secondary mt-3 <sm:m-l-4">
  약 {$query.searchSpaces.length ?? 0}개의 검색결과가 있어요!
</div>

<TabHead class="mt-9 mb-4 w-full <sm:(sticky top-61px z-1)" {search} variant="secondary">
  <TabHeadItem id={0} pathname="/search">전체</TabHeadItem>
  <TabHeadItem id={1} pathname="/search/post">포스트</TabHeadItem>
  <TabHeadItem id={2} pathname="/search/space">스페이스</TabHeadItem>
  <TabHeadItem id={3} pathname="/search/tag">태그</TabHeadItem>
</TabHead>

{#if $query.searchSpaces.length === 0}
  <div class="text-secondary body-15-b text-center flex center min-h-50">검색 결과가 없어요</div>
{:else}
  <div class="space-y-4 <sm:px-4">
    {#each $query.searchSpaces as space (space.id)}
      <div class="p-1 rounded-lg hover:bg-surface-primary flex items-center gap-4">
        <a href={`/${space.slug}`}>
          <Image class="square-15 rounded-5 border border-secondary" $image={space.icon} />
        </a>

        <a class="flex flex-col gap-1 grow" href={`/${space.slug}`}>
          <p class="body-15-b">{space.name}</p>
          <p class="body-14-m text-secondary">{space.description ?? ''}</p>
        </a>

        {#if !space.meAsMember}
          {#if space.followed}
            <button
              class="py-1.5 px-2 rounded-12 border border-secondary body-13-m flex items-center gap-1"
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
              class="py-1.5 px-2 rounded-12 bg-gray-90 text-gray-5 body-13-m flex items-center gap-1"
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

<LoginRequireModal bind:open={loginRequireOpen} />
