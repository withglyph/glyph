<script lang="ts">
  import { Helmet, Link } from '@penxle/ui';
  import MobileBanner from '$assets/images/mobile-banner.png';
  import WebBanner from '$assets/images/web-banner.png';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Image, Tag } from '$lib/components';
  import { TabHead, TabHeadItem } from '$lib/components/tab';
  import { toast } from '$lib/notification';
  import Footer from '../Footer.svelte';
  import Header from '../Header.svelte';
  import LoginRequireModal from '../LoginRequireModal.svelte';

  let loginRequireOpen = false;

  $: query = graphql(`
    query FeedLayout_Query {
      ...DefaultLayout_Header_query

      me {
        id

        ...MeCabinetsPage_FollowSpaceModal_user
        ...MeCabinetsPage_FollowTagModal_user
      }

      recentlyCreatedTags {
        id
        name
      }

      recentlyUsedTags {
        id
        name
      }

      recentlyPublishedSpaces {
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
    mutation FeedLayout_FollowSpace_Mutation($input: FollowSpaceInput!) {
      followSpace(input: $input) {
        id
        followed
      }
    }
  `);

  const unfollowSpace = graphql(`
    mutation FeedLayout_UnfollowSpace_Mutation($input: UnfollowSpaceInput!) {
      unfollowSpace(input: $input) {
        id
        followed
      }
    }
  `);
</script>

<Helmet
  description="펜슬은 개인 창작자들을 위한 자유롭고 즐거운 창작 공간이에요."
  image={{
    src: 'https://pnxl.net/assets/opengraph/default-cover.png',
    size: 'large',
  }}
  title="펜슬 - 함께 그리는 반짝임"
/>

<Header {$query} />

<main
  class="flex flex-col grow items-center justify-start w-full h-full truncate sm:(bg-primary mx-auto px-7.5) backgroundGrid <sm:(bg-primary)"
>
  <a class="sm:hidden" href="/penxle/736143117">
    <img alt="MobileBanner" src={MobileBanner} />
  </a>
  <div class="grid w-full max-w-300 sm:(p-0 gap-7.5 grid-cols-[8fr_2fr] mt-8) lg:grid-cols-[7.5fr_2.5fr]">
    <div class="flex flex-col w-full truncate">
      <div class="<sm:(pt-6 px-4 bg-cardprimary border-b border-secondary sticky top-0)">
        <TabHead class="gap-3! <sm:(bg-cardprimary pb-4) sm:(mb-8 mt-3)">
          <TabHeadItem id={1} class="title-20-b! leading-3!" pathname="/">추천 게시물</TabHeadItem>
          {#if $query.me}
            <TabHeadItem id={2} class="title-20-b! leading-3!" pathname="/followTags">관심 태그</TabHeadItem>
            <TabHeadItem id={3} class="title-20-b! leading-3!" pathname="/followSpaces">관심 스페이스</TabHeadItem>
          {:else}
            <button
              class="title-20-b w-fit border-b-10 leading-3 border-transparent transition hover:border-brand-50"
              type="button"
              on:click={() => (loginRequireOpen = true)}
            >
              관심 태그
            </button>
            <button
              class="title-20-b w-fit border-b-10 leading-3 border-transparent transition hover:border-brand-50"
              type="button"
              on:click={() => (loginRequireOpen = true)}
            >
              관심 스페이스
            </button>
          {/if}
        </TabHead>
      </div>

      <slot />
    </div>

    <div class="<sm:hidden space-y-10 sm:max-w-60 lg:max-w-80">
      <div>
        <Link class="inline-block mb-4" href="/penxle/736143117">
          <img class="rounded-9px" alt="WebBanner" src={WebBanner} />
        </Link>

        <p class="body-16-b mb-2">✨ 최근 게시물을 게시한 스페이스</p>

        <div class="px-1 py-2 bg-cardprimary border border-secondary rounded-2xl space-y-1">
          {#each $query.recentlyPublishedSpaces as space (space.id)}
            <div
              class="flex items-center justify-between p-2 transition hover:bg-surface-primary rounded-lg truncate gap-3"
            >
              <Link class="flex grow truncate" href={`/${space.slug}`}>
                <Image class="square-10.5 rounded-xl mr-3 flex-none border border-secondary" $image={space.icon} />
                <div class="grow basis-0 truncate">
                  <p class="body-15-b truncate">{space.name}</p>
                  <p class="body-13-m text-secondary truncate">{space.description ?? ''}</p>
                </div>
              </Link>
              {#if !space.meAsMember}
                {#if space.followed}
                  <button
                    class="py-1.5 px-2 rounded-12 body-13-m border border-secondary flex items-center gap-1"
                    type="button"
                    on:click={async () => {
                      await unfollowSpace({ spaceId: space.id });
                      mixpanel.track('space:unfollow', { spaceId: space.id, via: 'feed' });
                      toast.success('관심 스페이스 해제되었어요');
                    }}
                  >
                    <i class="i-lc-check" />
                    관심
                  </button>
                {:else}
                  <button
                    class="bg-gray-80 border border-gray-80 py-1.5 px-2 rounded-12 body-13-m text-gray-5"
                    type="button"
                    on:click={async () => {
                      if (!$query.me) {
                        loginRequireOpen = true;
                        return;
                      }
                      await followSpace({ spaceId: space.id });
                      mixpanel.track('space:follow', { spaceId: space.id, via: 'feed' });
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
      </div>

      <div>
        <p class="body-16-b mb-2">🔥 최근 사용된 태그</p>

        <div class="flex flex-wrap gap-2 bg-cardprimary border border-secondary rounded-2xl px-3 py-4 truncate">
          {#each $query.recentlyUsedTags as tag (tag.id)}
            <Tag class="max-w-65" href={`/tag/${tag.name}`} size="sm">#{tag.name}</Tag>
          {/each}
        </div>
      </div>

      <div class="sticky top-88px mb-4">
        <p class="body-16-b mb-2">👋🏻 새로 추가된 태그</p>

        <div class="flex flex-wrap gap-2 bg-cardprimary border border-secondary rounded-2xl px-3 py-4 mb-4 truncate">
          {#each $query.recentlyCreatedTags as tag (tag.id)}
            <Tag class="max-w-65" href={`/tag/${tag.name}`} size="sm">#{tag.name}</Tag>
          {/each}
        </div>
      </div>

      <!-- <div class="sticky top-88px">
      <p class="body-16-b mb-4">💰 오늘의 유료글</p>

      <div class="py-2 px-1 bg-cardprimary border border-secondary rounded-2xl mb-4">
        <div class="p-2 rounded-lg transition hover:bg-primary">
          <div class="flex gap-3 items-center mb-2.5">
            <img
              class="square-6 rounded-lg"
              alt="memberProfile"
              src="https://pnxl.net/images/23/10/n/nn/nn0f8jh65wx4qv2z.jpg?s=128"
            />
            <p class="body-13-b">test의 포스트</p>
          </div>
          <p class="mt-2 body-15-b">유료 테스트</p>
        </div>
      </div>
    </div> -->
    </div>
  </div>
</main>

<Footer />

<LoginRequireModal bind:open={loginRequireOpen} />

<style>
  .backgroundGrid {
    @media (min-width: 800px) {
      background-size: 33px 33px;
      background-image: linear-gradient(to right, #f1f1f0 1px, transparent 1px),
        linear-gradient(to bottom, #f1f1f0 1px, transparent 1px);
    }
  }
</style>
