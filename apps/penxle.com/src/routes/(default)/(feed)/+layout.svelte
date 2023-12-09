<script lang="ts">
  import { Helmet, Link } from '@penxle/ui';
  import { graphql } from '$glitch';
  import { ChannelIOButton } from '$lib/channel.io';
  import { Image, Tag } from '$lib/components';
  import { TabHead, TabHeadItem } from '$lib/components/tab';
  import { toast } from '$lib/notification';
  import LoginRequireModal from '../LoginRequireModal.svelte';

  let loginRequireOpen = false;

  $: query = graphql(`
    query FeedLayout_Query {
      ...ChannelIOButton_query

      me {
        id
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

<div class="flex">
  <div class="flex flex-col w-full max-w-185 my-6">
    <TabHead class="mb-9">
      <TabHeadItem id={1} href="/">추천 게시물</TabHeadItem>
      <TabHeadItem id={2} href="/followTags">관심 태그</TabHeadItem>
      <TabHeadItem id={3} href="/followSpaces">관심 스페이스</TabHeadItem>
    </TabHead>

    <div class="space-y-11.5 grow">
      <slot />
    </div>
  </div>

  <div class="w-full max-w-90 mt-20 ml-15 space-y-10">
    <div>
      <p class="body-15-b mb-4">✨ 최근 게시물을 게시한 스페이스</p>

      {#each $query.recentlyPublishedSpaces as space (space.id)}
        <div class="flex items-center justify-between p-2 hover:bg-surface-primary rounded-lg truncate gap-3">
          <Link class="flex grow truncate" href={`/${space.slug}`}>
            <Image class="square-10.5 rounded-xl mr-3 flex-none" $image={space.icon} />
            <div class="grow basis-0 truncate">
              <p class="body-15-b truncate">{space.name}</p>
              <p class="body-13-m text-secondary truncate">{space.description ?? ''}</p>
            </div>
          </Link>

          {#if space.followed}
            <button
              class="bg-gray-80 py-2 px-3 rounded-12 body-13-m text-gray-5"
              type="button"
              on:click={async () => {
                await unfollowSpace({ spaceId: space.id });
                toast.success('관심 스페이스 해제되었어요');
              }}
            >
              관심 해제
            </button>
          {:else}
            <button
              class="bg-gray-80 py-2 px-3 rounded-12 body-13-m text-gray-5"
              type="button"
              on:click={async () => {
                if (!$query.me) {
                  loginRequireOpen = true;
                  return;
                }
                await followSpace({ spaceId: space.id });
                toast.success('관심 스페이스로 등록되었어요');
              }}
            >
              + 관심
            </button>
          {/if}
        </div>
      {/each}
    </div>

    <div>
      <p class="body-15-b mb-4">🔥 최근 사용된 태그</p>

      <div class="flex flex-wrap gap-2">
        {#each $query.recentlyUsedTags as tag (tag.id)}
          <Tag href={`/tag/${tag.name}`} size="sm">#{tag.name}</Tag>
        {/each}
      </div>
    </div>

    <div>
      <p class="body-15-b mb-4">👋🏻 새로 추가된 태그</p>

      <div class="flex flex-wrap gap-2">
        {#each $query.recentlyCreatedTags as tag (tag.id)}
          <Tag href={`/tag/${tag.name}`} size="sm">#{tag.name}</Tag>
        {/each}
      </div>
    </div>

    <div>
      <p class="body-15-b mb-4">💰 오늘의 유료글</p>

      <div class="p-2.5">
        <div class="flex gap-3 items-center mb-2.5">
          <img
            class="square-6 rounded-full border border-bg-primary"
            alt="memberProfile"
            src="https://pnxl.net/images/23/10/n/nn/nn0f8jh65wx4qv2z.jpg?s=128"
          />
          <p class="body-13-sb">test의 포스트</p>
        </div>
        <p>유료 테스트</p>
      </div>

      <div class="p-2.5">
        <div class="flex gap-3 items-center mb-2.5">
          <img
            class="square-6 rounded-full border border-bg-primary"
            alt="memberProfile"
            src="https://pnxl.net/images/23/10/u/uj/ujx4cf6wq2b2ui0p.jpg?s=256"
          />
          <p class="body-13-sb">스페이스의 포스트</p>
        </div>
        <p>제목을 지어봤어요</p>
      </div>
    </div>
  </div>
</div>

<ChannelIOButton {$query} />
<LoginRequireModal bind:open={loginRequireOpen} />
