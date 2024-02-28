<script lang="ts">
  import clsx from 'clsx';
  import IconLock from '~icons/tabler/lock';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Icon, Modal } from '$lib/components';
  import { PopupSearch } from '$lib/components/forms';
  import Image from '$lib/components/Image.svelte';
  import { toast } from '$lib/notification';
  import type { MeCabinetsPage_FollowSpaceModal_user } from '$glitch';

  let _user: MeCabinetsPage_FollowSpaceModal_user;
  export { _user as $user };
  export let open = false;

  let followedSpaces: typeof $user.followedSpaces | undefined;
  let query = '';

  const setSpaces = () => {
    followedSpaces = $user.followedSpaces;
  };

  $: if (open) {
    setSpaces();
  }

  $: user = fragment(
    _user,
    graphql(`
      fragment MeCabinetsPage_FollowSpaceModal_user on User {
        id

        followedSpaces {
          id
          slug
          name
          description
          followed
          visibility

          icon {
            id
            ...Image_image
          }
        }
      }
    `),
  );

  const followSpace = graphql(`
    mutation MeCabinetsPage_FollowSpace_Mutation($input: FollowSpaceInput!) {
      followSpace(input: $input) {
        id
        followed
      }
    }
  `);

  const unfollowSpace = graphql(`
    mutation MeCabinetsPage_UnfollowSpace_Mutation($input: UnfollowSpaceInput!) {
      unfollowSpace(input: $input) {
        id
        followed
      }
    }
  `);

  $: filteredSpaces = followedSpaces?.filter((space) => space.name.includes(query));
</script>

<Modal size="md" bind:open>
  <svelte:fragment slot="title">관심 스페이스</svelte:fragment>

  <PopupSearch
    class={clsx('mb-4', followedSpaces?.length === 0 && 'hidden')}
    on:input={(event) => (query = event.currentTarget.value.trim())}
  />

  <ul
    class={clsx(
      'flex flex-col gap-4 min-h-10rem max-h-15rem overflow-y-auto',
      filteredSpaces?.length === 0 && 'justify-center',
    )}
  >
    {#each filteredSpaces ?? [] as space (space.id)}
      <li class="flex items-center justify-between">
        <svelte:element
          this={space.visibility === 'PRIVATE' ? 'div' : 'a'}
          class="flex gap-2 truncate mr-2 grow"
          href={space.visibility === 'PRIVATE' ? undefined : `/${space.slug}`}
        >
          <Image class="square-10.5 rounded-lg flex-none border border-secondary" $image={space.icon} />
          <div class="truncate">
            <div class="flex items-center gap-1">
              <p class="body-15-b truncate">
                {space.name}
              </p>
              {#if space.visibility === 'PRIVATE'}
                <span class="bg-primary text-secondary rounded-full px-1 caption-12-b text-nowrap">
                  비공개
                  <Icon class="square-3 mb-0.5" icon={IconLock} />
                </span>
              {/if}
            </div>
            <p class="body-13-m text-secondary truncate">{space.description ?? ''}</p>
          </div>
        </svelte:element>
        {#if $user.followedSpaces.find((follow) => follow.id === space.id)}
          <Button
            class="shrink-0"
            color="tertiary"
            size="md"
            variant="outlined"
            on:click={async () => {
              await unfollowSpace({ spaceId: space.id });
              mixpanel.track('space:unfollow', { spaceId: space.id, via: 'cabinet' });
              toast.success('관심 스페이스 해제되었어요');
            }}
          >
            해제
          </Button>
        {:else}
          <Button
            class="shrink-0"
            color="secondary"
            size="md"
            on:click={async () => {
              await followSpace({ spaceId: space.id });
              mixpanel.track('space:follow', { spaceId: space.id, via: 'cabinet' });
              toast.success('관심 스페이스로 등록되었어요');
            }}
          >
            등록
          </Button>
        {/if}
      </li>
    {:else}
      <article class="text-secondary body-16-m text-center break-keep">
        {#if followedSpaces}
          {followedSpaces.length === 0 ? '아직 추가된 관심 스페이스가 없어요' : '일치하는 검색 결과가 없어요'}
        {/if}
      </article>
    {/each}
  </ul>
</Modal>
