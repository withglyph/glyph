<script lang="ts">
  import { graphql } from '$glitch';
  import { Button, Tag } from '$lib/components';
  import Image from '$lib/components/Image.svelte';
  import { TabHead, TabHeadItem } from '$lib/components/tab';
  import { toast } from '$lib/notification';
  import LoginRequireModal from '../LoginRequireModal.svelte';

  let moveToLoginOpen = false;

  $: query = graphql(`
    query SpaceLayout_Query($slug: String!) {
      me {
        id
      }

      space(slug: $slug) {
        id
        slug
        name
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
    mutation SpaceLayout_FollowSpace_Mutation($input: FollowSpaceInput!) {
      followSpace(input: $input) {
        id
        followed
      }
    }
  `);

  const unfollowSpace = graphql(`
    mutation SpaceLayout_UnfollowSpace_Mutation($input: UnfollowSpaceInput!) {
      unfollowSpace(input: $input) {
        id
        followed
      }
    }
  `);
</script>

<main class="flex flex-col items-center w-full bg-cardprimary">
  <div class="pt-6 px-4 bg-cardprimary w-full max-w-200 sm:(flex gap-6) sm:mb-8">
    <div class="flex items-start justify-between">
      <Image class="square-15 rounded-2xl sm:(square-30 rounded-3xl mr-6)" $image={$query.space.icon} />
      <button class="square-9 flex center rounded-xl transition duration-300 hover:bg-primary sm:hidden" type="button">
        <span class="i-lc-share square-6 text-icon-secondary" />
      </button>
    </div>
    <div class="flex-1">
      <div class="my-5 sm:(mt-0 mb-3)">
        <h1 class="title-20-eb mb-2 sm:(title-24-eb mb-3)">{$query.space.name}</h1>
        <div class="flex items-center mb-2">
          <span class="text-secondary body-16-sb">관심 독자</span>
          <span class="text-primary ml-2 subtitle-18-b">3</span>
          <span class="ml-3 text-secondary body-16-sb">포스트</span>
          <span class="text-primary ml-2 subtitle-18-b">17</span>
        </div>
        <p class="body-15-sb text-secondary">penxle.com/penxle.. 외 2개</p>
      </div>
      <div class="flex flex-wrap gap-2 sm:hidden">
        <Tag>#태그</Tag>
        <Tag>#태그</Tag>
        <Tag>#태그</Tag>
        <Tag>#태그</Tag>
        <Tag>#태그</Tag>
      </div>
      <div class="flex flex-wrap gap-2 <sm:hidden">
        <Tag size="sm">#태그</Tag>
        <Tag size="sm">#태그</Tag>
        <Tag size="sm">#태그</Tag>
        <Tag size="sm">#태그</Tag>
        <Tag size="sm">#태그</Tag>
      </div>
    </div>
    <div class="flex self-start items-center gap-2 <sm:hidden">
      {#if $query.space.meAsMember}
        <Button href={`/${$query.space.slug}/publish/post`} size="md" type="link">포스트 작성</Button>
        <Button color="tertiary" size="md" variant="outlined">
          <span class="i-lc-share mr-2" />
          공유하기
        </Button>
        <a
          class="border border-secondary rounded-xl square-9 p-1 flex center transition duration-300 hover:border-primary"
          href={`/${$query.space.slug}/settings`}
        >
          <span class="i-lc-settings square-6 text-secondary" />
        </a>
      {:else}
        {#if $query.me === null}
          <Button
            class="flex-1"
            size="md"
            on:click={() => {
              moveToLoginOpen = true;
            }}
          >
            + 관심
          </Button>
        {:else if $query.space.followed}
          <Button
            class="flex-1"
            color="tertiary"
            size="md"
            variant="outlined"
            on:click={async () => {
              await unfollowSpace({ spaceId: $query.space.id });
              toast.success('관심 스페이스 해제되었어요');
            }}
          >
            관심 해제
          </Button>
        {:else}
          <Button
            class="flex-1"
            size="md"
            on:click={async () => {
              await followSpace({ spaceId: $query.space.id });
              toast.success('관심 스페이스로 등록되었어요');
            }}
          >
            + 관심
          </Button>
        {/if}
        <Button color="tertiary" size="md" variant="outlined">
          <span class="i-lc-share mr-2" />
          공유하기
        </Button>
      {/if}
    </div>
  </div>
  <div class="flex gap-2 w-full mt-6 mb-3 px-4 sm:hidden">
    {#if $query.space.meAsMember}
      <Button class="<sm:w-full" href={`/${$query.space.slug}/publish/post`} size="xl" type="link">포스트 작성</Button>
      <Button
        class="square-12.5"
        color="tertiary"
        href={`/${$query.space.slug}/settings`}
        size="xl"
        type="link"
        variant="outlined"
      >
        <span class="i-lc-settings square-6 text-secondary" />
      </Button>
    {:else if $query.me === null}
      <Button
        class="w-full"
        size="xl"
        on:click={() => {
          moveToLoginOpen = true;
        }}
      >
        관심 스페이스 등록하기
      </Button>
    {:else if $query.space.followed}
      <Button
        class="w-full"
        color="tertiary"
        size="xl"
        variant="outlined"
        on:click={async () => {
          await unfollowSpace({ spaceId: $query.space.id });
          toast.success('관심 스페이스 해제되었어요');
        }}
      >
        관심 스페이스 해제하기
      </Button>
    {:else}
      <Button
        class="w-full"
        size="xl"
        on:click={async () => {
          await followSpace({ spaceId: $query.space.id });
          toast.success('관심 스페이스로 등록되었어요');
        }}
      >
        관심 스페이스 등록하기
      </Button>
    {/if}
  </div>

  <TabHead class="w-full max-w-200 border-none" variant="secondary">
    <TabHeadItem id={1} href="/{$query.space.slug}" variant="secondary">
      <span>홈</span>
    </TabHeadItem>
    <TabHeadItem id={2} href="/{$query.space.slug}/collections" variant="secondary">
      <span>컬렉션</span>
    </TabHeadItem>
    <TabHeadItem id={3} href="/{$query.space.slug}/about" variant="secondary">
      <span>소개</span>
    </TabHeadItem>
  </TabHead>

  <hr class="w-full border-color-alphagray-10" />

  <slot />
</main>

<LoginRequireModal bind:open={moveToLoginOpen} />
