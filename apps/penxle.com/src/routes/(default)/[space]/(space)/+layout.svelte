<script lang="ts">
  import { Link } from '@penxle/ui';
  import { graphql } from '$glitch';
  import { BottomSheet, Button, Modal, Tag } from '$lib/components';
  import Image from '$lib/components/Image.svelte';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { TabHead, TabHeadItem } from '$lib/components/tab';
  import { toast } from '$lib/notification';
  import { handleShare } from '$lib/utils';
  import LoginRequireModal from '../../LoginRequireModal.svelte';

  let moveToLoginOpen = false;
  let menuOpen = false;
  let linkOpen = false;

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

  const updateSpace = graphql(`
    mutation SpaceLayout_UpdateSpace_Mutation($input: UpdateSpaceInput!) {
      updateSpace(input: $input) {
        id
        visibility
      }
    }
  `);
</script>

<main class="flex flex-col items-center w-full bg-cardprimary grow">
  <div class="pt-6 px-4 bg-cardprimary w-full max-w-200 sm:(flex gap-6 mb-8)">
    <div class="flex items-start justify-between">
      <Image class="square-15 rounded-2xl sm:(square-30 rounded-3xl mr-6)" $image={$query.space.icon} />
      <div class="flex">
        <button
          class="square-9 flex center rounded-xl transition duration-300 hover:bg-primary sm:hidden"
          type="button"
          on:click={() => {
            handleShare($query.space.name, `${location.origin}/${$query.space.slug}`);
          }}
        >
          <span class="i-lc-share square-6 text-icon-secondary" />
        </button>
        <button
          class="square-9 flex center rounded-xl transition duration-300 hover:bg-primary sm:hidden"
          type="button"
          on:click={() => {
            menuOpen = true;
          }}
        >
          <span class="i-lc-more-vertical square-6 text-icon-secondary" />
        </button>
      </div>
    </div>
    <div class="flex-1">
      <div class="my-5 sm:(mt-0 mb-3)">
        <h1 class="title-20-eb flex items-center gap-1 flex-wrap mb-2 sm:(title-24-eb mb-3)">
          {$query.space.name}

          {#if $query.space.visibility === 'PRIVATE'}
            <span class="bg-gray-10 text-secondary rounded-2xl py-1 px-1.5 caption-12-b text-nowrap">
              비공개
              <i class="i-px-lock square-3 mb-0.5" />
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
        <Button href={`/editor?space=${$query.space.slug}`} size="md" type="link">포스트 작성</Button>
        <Button
          color="tertiary"
          size="md"
          variant="outlined"
          on:click={() => {
            handleShare($query.space.name, `${location.origin}/${$query.space.slug}`);
          }}
        >
          <span class="i-lc-share mr-2" />
          공유하기
        </Button>
        <a
          class="border border-secondary rounded-xl square-9 p-1 flex center transition duration-300 hover:border-primary"
          href={`/${$query.space.slug}/dashboard`}
        >
          <span class="i-lc-settings square-6 text-secondary" />
        </a>
        {#if $query.space.meAsMember.role === 'ADMIN'}
          <Menu>
            <button
              slot="value"
              class="border border-secondary rounded-xl square-9 p-1 flex center transition duration-300 hover:border-primary"
              type="button"
            >
              <span class="i-lc-more-vertical square-6 text-secondary" />
            </button>

            <MenuItem
              on:click={async () => {
                await updateSpace({
                  spaceId: $query.space.id,
                  isPublic: $query.space.visibility === 'PUBLIC' ? false : true,
                });

                toast.success(`${$query.space.visibility === 'PUBLIC' ? '공개' : '비공개'} 스페이스로 변경되었어요`);
                menuOpen = false;
              }}
            >
              {#if $query.space.visibility === 'PUBLIC'}
                비공개 스페이스로 변경
              {:else}
                공개 스페이스로 변경
              {/if}
            </MenuItem>
          </Menu>
        {/if}
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
        <Button
          color="tertiary"
          size="md"
          variant="outlined"
          on:click={() => {
            handleShare($query.space.name, `${location.origin}/${$query.space.slug}`);
          }}
        >
          <span class="i-lc-share mr-2" />
          공유하기
        </Button>
        <Menu>
          <button
            slot="value"
            class="border border-secondary rounded-xl square-9 p-1 flex center transition duration-300 hover:border-primary"
            type="button"
          >
            <span class="i-lc-more-vertical square-6 text-secondary" />
          </button>

          {#if $query.space.muted}
            <MenuItem
              on:click={async () => {
                await unmuteSpace({ spaceId: $query.space.id });
                toast.success('스페이스 숨기기 해제되었어요');
              }}
            >
              스페이스 숨기기 해제
            </MenuItem>
          {:else}
            <MenuItem
              on:click={async () => {
                await muteSpace({ spaceId: $query.space.id });
                toast.success('스페이스를 숨겼어요');
              }}
            >
              스페이스 숨기기
            </MenuItem>
          {/if}
          <MenuItem>스페이스 신고하기</MenuItem>
        </Menu>
      {/if}
    </div>
  </div>
  <div class="flex gap-2 w-full mt-6 mb-3 px-4 sm:hidden">
    {#if $query.space.meAsMember}
      <Button class="<sm:w-full" href={`/editor?space=${$query.space.slug}`} size="xl" type="link">포스트 작성</Button>
      <Button
        class="square-12.5"
        color="tertiary"
        href={`/${$query.space.slug}/dashboard`}
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

<BottomSheet bind:open={menuOpen}>
  <div class="body-15-b py-2 text-center">더보기</div>

  <div class="mt-2">
    {#if $query.space.meAsMember?.role === 'ADMIN'}
      <button
        class="w-full px-3 h-14 text-secondary text-center body-16-sb rounded-2xl hover:bg-primary"
        type="button"
        on:click={() => {
          handleShare($query.space.name, `${location.origin}/${$query.space.slug}`);
        }}
      >
        스페이스 공유하기
      </button>
      <button
        class="w-full px-3 h-14 text-secondary text-center body-16-sb rounded-2xl hover:bg-primary"
        type="button"
        on:click={async () => {
          await updateSpace({
            spaceId: $query.space.id,
            isPublic: $query.space.visibility === 'PUBLIC' ? false : true,
          });

          toast.success(`${$query.space.visibility === 'PUBLIC' ? '공개' : '비공개'} 스페이스로 변경되었어요`);
          menuOpen = false;
        }}
      >
        {#if $query.space.visibility === 'PUBLIC'}
          비공개 스페이스로 변경
        {:else}
          공개 스페이스로 변경
        {/if}
      </button>
    {:else}
      {#if $query.space.muted}
        <button
          class="w-full px-3 h-14 text-secondary text-center body-16-sb rounded-2xl hover:bg-primary"
          type="button"
          on:click={async () => {
            await unmuteSpace({ spaceId: $query.space.id });
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
            toast.success('스페이스를 숨겼어요');
          }}
        >
          스페이스 숨기기
        </button>
      {/if}

      <button class="w-full px-3 h-14 text-secondary text-center body-16-sb rounded-2xl hover:bg-primary" type="button">
        스페이스 신고하기
      </button>
    {/if}
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
