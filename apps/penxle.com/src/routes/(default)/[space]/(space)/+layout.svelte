<script lang="ts">
  import { Link } from '@penxle/ui';
  import IconDotsVertical from '~icons/tabler/dots-vertical';
  import IconLock from '~icons/tabler/lock';
  import IconSettings from '~icons/tabler/settings';
  import IconShare2 from '~icons/tabler/share-2';
  import { goto } from '$app/navigation';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { BottomSheet, Button, Icon, Image, Modal } from '$lib/components';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { TabHead, TabHeadItem } from '$lib/components/tab';
  import { toast } from '$lib/notification';
  import { handleShare } from '$lib/utils';
  import LoginRequireModal from '../../LoginRequireModal.svelte';

  let moveToLoginOpen = false;
  let menuOpen = false;
  let linkOpen = false;
  let revealMutedSpace = false;

  $: query = graphql(`
    query SpaceLayout_Query($slug: String!) {
      me {
        id
      }

      space(slug: $slug) {
        id
        slug
        name
        muted
        followed
        followerCount
        postCount
        visibility

        externalLinks {
          id
          url
        }

        icon {
          id
          ...Image_image
        }

        meAsMember {
          id
          role
        }
      }
    }
  `);

  const followSpace = graphql(`
    mutation SpaceLayout_FollowSpace_Mutation($input: FollowSpaceInput!) {
      followSpace(input: $input) {
        id
        followed
        followerCount
      }
    }
  `);

  const unfollowSpace = graphql(`
    mutation SpaceLayout_UnfollowSpace_Mutation($input: UnfollowSpaceInput!) {
      unfollowSpace(input: $input) {
        id
        followed
        followerCount
      }
    }
  `);

  const muteSpace = graphql(`
    mutation SpaceLayout_MuteSpace_Mutation($input: MuteSpaceInput!) {
      muteSpace(input: $input) {
        id
        muted
      }
    }
  `);

  const unmuteSpace = graphql(`
    mutation SpaceLayout_UnmuteSpace_Mutation($input: UnmuteSpaceInput!) {
      unmuteSpace(input: $input) {
        id
        muted
      }
    }
  `);

  const createPost = graphql(`
    mutation SpaceLayout_CreatePost_Mutation($input: CreatePostInput!) {
      createPost(input: $input) {
        id
        permalink
      }
    }
  `);
</script>

<main class="flex flex-col items-center w-full bg-cardprimary grow">
  <div class="pt-6 px-4 bg-cardprimary w-full max-w-200 sm:(flex mb-8)">
    <div class="flex items-start justify-between">
      <Image
        class="square-15 rounded-2xl border border-secondary sm:(square-30 rounded-3xl mr-6)"
        $image={$query.space.icon}
      />
      <div class="flex">
        <button
          class="square-9 flex center rounded-xl transition duration-300 hover:bg-primary sm:hidden"
          type="button"
          on:click={() => {
            handleShare($query.space.name, `${location.origin}/${$query.space.slug}`);
          }}
        >
          <Icon class="square-6 text-icon-secondary" icon={IconShare2} />
        </button>
        {#if !$query.space.meAsMember}
          <button
            class="square-9 flex center rounded-xl transition duration-300 hover:bg-primary sm:hidden"
            type="button"
            on:click={() => {
              menuOpen = true;
            }}
          >
            <Icon class="square-6 text-icon-secondary" icon={IconDotsVertical} />
          </button>
        {/if}
      </div>
    </div>
    <div class="flex-1 sm:mr-6">
      <div class="mt-5 truncate sm:(mt-0 mb-3)">
        <h1 class="title-20-eb flex items-center gap-1 flex-wrap mb-2 truncate sm:(title-24-eb mb-3)">
          {$query.space.name}

          {#if $query.space.visibility === 'PRIVATE'}
            <span class="bg-gray-10 text-secondary rounded-2xl py-1 px-1.5 caption-12-b text-nowrap">
              비공개
              <Icon class="square-3 mb-0.5" icon={IconLock} />
            </span>
          {/if}
        </h1>

        <div class="flex items-center mb-2">
          <span class="text-secondary body-16-sb">관심 독자</span>
          <span class="text-primary ml-2 subtitle-18-b">{$query.space.followerCount}</span>
          <span class="ml-3 text-secondary body-16-sb">포스트</span>
          <span class="text-primary ml-2 subtitle-18-b">{$query.space.postCount}</span>
        </div>
        {#if $query.space.externalLinks.length > 0}
          <div class="flex gap-1 body-15-sb text-secondary flex-wrap">
            <Link class="truncate" external href={`${$query.space.externalLinks[0].url}`} underline>
              {$query.space.externalLinks[0].url}
            </Link>

            <button class="whitespace-pre-wrap" type="button" on:click={() => (linkOpen = true)}>
              {#if $query.space.externalLinks.length > 1}
                외 {$query.space.externalLinks.length - 1}개
              {/if}
            </button>
          </div>
        {/if}
      </div>
    </div>
    <div class="flex self-start items-center gap-2 <sm:hidden">
      {#if $query.space.meAsMember}
        <Button
          size="md"
          on:click={async () => {
            const { permalink } = await createPost({ spaceId: $query.space.id });
            mixpanel.track('post:create', { via: 'space' });
            await goto(`/editor/${permalink}`);
          }}
        >
          포스트 작성
        </Button>
        <Button
          color="tertiary"
          size="md"
          variant="outlined"
          on:click={() => {
            handleShare($query.space.name, `${location.origin}/${$query.space.slug}`);
          }}
        >
          <Icon class="mr-2" icon={IconShare2} />
          공유하기
        </Button>
        <a
          class="border border-secondary rounded-xl square-9 p-1 flex center transition duration-300 hover:border-primary"
          href={`/${$query.space.slug}/dashboard/settings`}
        >
          <Icon class="square-6 text-secondary" icon={IconSettings} />
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
              mixpanel.track('space:unfollow', { spaceId: $query.space.id, via: 'space' });
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
              mixpanel.track('space:follow', { spaceId: $query.space.id, via: 'space' });
              toast.success('관심 스페이스로 등록되었어요');
            }}
          >
            + 관심
          </Button>
        {/if}
        <Button
          color="tertiary"
          size="md"
          variant="outlined"
          on:click={() => {
            handleShare($query.space.name, `${location.origin}/${$query.space.slug}`);
          }}
        >
          <Icon class="mr-2" icon={IconShare2} />
          공유하기
        </Button>
        {#if !$query.space.meAsMember}
          <Menu
            class="border border-secondary rounded-xl square-9 p-1 flex center transition duration-300 hover:border-primary"
          >
            <Icon slot="value" class="square-6 text-secondary" icon={IconDotsVertical} />

            {#if $query.space.muted}
              <MenuItem
                on:click={async () => {
                  await unmuteSpace({ spaceId: $query.space.id });
                  mixpanel.track('space:unmute', { spaceId: $query.space.id, via: 'space' });
                  toast.success('스페이스 숨기기 해제되었어요');
                }}
              >
                스페이스 숨기기 해제
              </MenuItem>
            {:else}
              <MenuItem
                on:click={async () => {
                  await muteSpace({ spaceId: $query.space.id });
                  mixpanel.track('space:mute', { spaceId: $query.space.id, via: 'space' });
                  toast.success('스페이스를 숨겼어요');
                }}
              >
                스페이스 숨기기
              </MenuItem>
            {/if}
            <MenuItem>스페이스 신고하기</MenuItem>
          </Menu>
        {/if}
      {/if}
    </div>
  </div>
  <div class="flex gap-2 w-full mt-6 mb-3 px-4 sm:hidden">
    {#if $query.space.meAsMember}
      <Button
        class="<sm:w-full"
        size="xl"
        on:click={async () => {
          const { permalink } = await createPost({ spaceId: $query.space.id });
          mixpanel.track('post:create', { via: 'space' });
          await goto(`/editor/${permalink}`);
        }}
      >
        포스트 작성
      </Button>
      <Button
        class="square-12.5"
        color="tertiary"
        href={`/${$query.space.slug}/dashboard/settings`}
        size="xl"
        type="link"
        variant="outlined"
      >
        <Icon class="square-6 text-secondary" icon={IconSettings} />
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
          mixpanel.track('space:unfollow', { spaceId: $query.space.id, via: 'space' });
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
          mixpanel.track('space:follow', { spaceId: $query.space.id, via: 'space' });
          toast.success('관심 스페이스로 등록되었어요');
        }}
      >
        관심 스페이스 등록하기
      </Button>
    {/if}
  </div>

  <TabHead class="w-full max-w-200 border-none" variant="secondary">
    <TabHeadItem id={1} pathname="/{$query.space.slug}">
      <span>홈</span>
    </TabHeadItem>
    <TabHeadItem id={2} pathname="/{$query.space.slug}/collections">
      <span>컬렉션</span>
    </TabHeadItem>
    <TabHeadItem id={3} pathname="/{$query.space.slug}/about">
      <span>소개</span>
    </TabHeadItem>
  </TabHead>

  <hr class="w-full border-color-alphagray-10" />

  {#if $query.space.muted && !revealMutedSpace}
    <div class="w-full min-h-11rem max-w-50rem flex flex-col center grow body-15-sb text-secondary">
      <p>내가 숨긴 스페이스예요</p>
      <p>내용을 보시겠어요?</p>
      <p>(스페이스 숨김은 유지돼요)</p>
      <Button class="w-fit mt-5" size="lg" on:click={() => (revealMutedSpace = true)}>내용 보기</Button>
    </div>
  {:else}
    <slot />
  {/if}
</main>

<LoginRequireModal bind:open={moveToLoginOpen} />

<BottomSheet bind:open={menuOpen}>
  <div class="body-15-b py-2 text-center">더보기</div>

  <div class="mt-2">
    {#if $query.space.muted}
      <button
        class="w-full px-3 h-14 text-secondary text-center body-16-sb rounded-2xl hover:bg-primary"
        type="button"
        on:click={async () => {
          await unmuteSpace({ spaceId: $query.space.id });
          mixpanel.track('space:unmute', { spaceId: $query.space.id, via: 'space' });
          toast.success('스페이스 숨기기 해제되었어요');
        }}
      >
        스페이스 숨기기 해제
      </button>
    {:else}
      <button
        class="w-full px-3 h-14 text-secondary text-center body-16-sb rounded-2xl hover:bg-primary"
        type="button"
        on:click={async () => {
          await muteSpace({ spaceId: $query.space.id });
          mixpanel.track('space:mute', { spaceId: $query.space.id, via: 'space' });
          toast.success('스페이스를 숨겼어요');
        }}
      >
        스페이스 숨기기
      </button>
    {/if}

    <button class="w-full px-3 h-14 text-secondary text-center body-16-sb rounded-2xl hover:bg-primary" type="button">
      스페이스 신고하기
    </button>
  </div>
</BottomSheet>

<BottomSheet bind:open={linkOpen}>
  <div class="body-15-b py-2 text-center">링크</div>

  <div class="flex flex-col mt-2 truncate">
    {#each $query.space.externalLinks as link (link.id)}
      <Link
        class="px-3 py-4.5 body-16-sb truncate text-secondary rounded-2xl hover:bg-primary"
        external
        href={link.url}
      >
        {link.url}
      </Link>
    {/each}
  </div>
</BottomSheet>

<Modal bind:open={linkOpen}>
  <svelte:fragment slot="title">링크</svelte:fragment>

  <div class="flex flex-col truncate">
    {#each $query.space.externalLinks as link (link.id)}
      <Link
        class="px-3 py-4.5 body-16-sb truncate text-secondary rounded-2xl hover:bg-primary"
        external
        href={link.url}
      >
        {link.url}
      </Link>
    {/each}
  </div>
</Modal>
