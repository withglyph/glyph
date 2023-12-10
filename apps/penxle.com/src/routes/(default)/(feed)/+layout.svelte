<script lang="ts">
  import { Helmet, Link } from '@penxle/ui';
  import clsx from 'clsx';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { ChannelIOButton } from '$lib/channel.io';
  import { Image, Tag } from '$lib/components';
  import { toast } from '$lib/notification';
  import LoginRequireModal from '../LoginRequireModal.svelte';
  import FollowSpaceModal from '../me/cabinets/FollowSpaceModal.svelte';
  import FollowTagModal from '../me/cabinets/FollowTagModal.svelte';

  let loginRequireOpen = false;
  let followingSpaceOpen = false;
  let followingTagOpen = false;

  $: query = graphql(`
    query FeedLayout_Query {
      ...ChannelIOButton_query

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

<div class="grid gap-7.5 grid-cols-[2.5fr_7fr_3fr] mt-20 max-w-300 mx-10">
  <div>
    <div class="bg-white py-4 px-2 rounded-2xl border border-secondary flex flex-col sticky top-88px">
      <a
        class={clsx(
          'py-3 px-2 subtitle-18-b text-secondary rounded-lg hover:(text-primary bg-primary)',
          $page.url.pathname === '/' && 'text-primary!',
        )}
        href="/"
      >
        추천 게시물
      </a>
      <div class="flex items-center justify-between py-3 px-2 rounded-lg hover:(text-primary bg-primary)">
        <svelte:element
          this={$query.me ? 'a' : 'button'}
          class={clsx('subtitle-18-b text-secondary grow', $page.url.pathname === '/followTags' && 'text-primary!')}
          href={$query.me ? '/followTags' : undefined}
          role="button"
          tabindex="-1"
          on:click={() => {
            if (!$query.me) {
              loginRequireOpen = true;
            }
          }}
        >
          관심 태그
        </svelte:element>
        {#if $query.me}
          <button
            class="i-lc-settings color-icon-tertiary square-4"
            type="button"
            on:click={() => (followingTagOpen = true)}
          />
        {/if}
      </div>
      <div class="flex items-center justify-between py-3 px-2 rounded-lg hover:(text-primary bg-primary)">
        <svelte:element
          this={$query.me ? 'a' : 'button'}
          class={clsx('subtitle-18-b text-secondary', $page.url.pathname === '/followSpaces' && 'text-primary!')}
          href={$query.me ? '/followSpaces' : undefined}
          role="button"
          tabindex="-1"
          on:click={() => {
            if (!$query.me) {
              loginRequireOpen = true;
            }
          }}
        >
          관심 스페이스
        </svelte:element>
        {#if $query.me}
          <button
            class="i-lc-settings color-icon-tertiary square-4"
            type="button"
            on:click={() => (followingSpaceOpen = true)}
          />
        {/if}
      </div>
    </div>
  </div>

  <div class="flex flex-col w-full max-w-185">
    <slot />
  </div>

  <div class="space-y-10">
    <div>
      <p class="body-15-b mb-4">✨ 최근 게시물을 게시한 스페이스</p>

      <div class="px-1 py-2 bg-cardprimary border border-secondary rounded-2xl space-y-1">
        {#each $query.recentlyPublishedSpaces as space (space.id)}
          <div
            class="flex items-center justify-between p-2 transition hover:bg-surface-primary rounded-lg truncate gap-3"
          >
            <Link class="flex grow truncate" href={`/${space.slug}`}>
              <Image class="square-10.5 rounded-xl mr-3 flex-none" $image={space.icon} />
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
      <p class="body-15-b mb-4">🔥 최근 사용된 태그</p>

      <div class="flex flex-wrap gap-2 bg-cardprimary border border-secondary rounded-2xl px-3 py-4">
        {#each $query.recentlyUsedTags as tag (tag.id)}
          <Tag href={`/tag/${tag.name}`} size="sm">#{tag.name}</Tag>
        {/each}
      </div>
    </div>

    <div class="sticky top-88px mb-4">
      <p class="body-15-b mb-4">👋🏻 새로 추가된 태그</p>

      <div class="flex flex-wrap gap-2 bg-cardprimary border border-secondary rounded-2xl px-3 py-4 mb-4">
        {#each $query.recentlyCreatedTags as tag (tag.id)}
          <Tag href={`/tag/${tag.name}`} size="sm">#{tag.name}</Tag>
        {/each}
      </div>
    </div>

    <!-- <div class="sticky top-88px">
      <p class="body-15-b mb-4">💰 오늘의 유료글</p>

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

<ChannelIOButton {$query} />
<LoginRequireModal bind:open={loginRequireOpen} />

{#if $query.me}
  <FollowSpaceModal $user={$query.me} bind:open={followingSpaceOpen} />
  <FollowTagModal $user={$query.me} bind:open={followingTagOpen} />
{/if}
