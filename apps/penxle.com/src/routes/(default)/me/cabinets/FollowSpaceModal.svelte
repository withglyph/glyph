<script lang="ts">
  import { fragment, graphql } from '$glitch';
  import { Button, Modal } from '$lib/components';
  import Image from '$lib/components/Image.svelte';
  import { toast } from '$lib/notification';
  import type { MeCabinetsPage_FollowSpaceModal_user } from '$glitch';

  let _user: MeCabinetsPage_FollowSpaceModal_user;
  export { _user as $user };
  export let open = false;

  let followedSpaces: typeof $user.followedSpaces;
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
          name
          description
          followed

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
</script>

<Modal size="md" bind:open>
  <svelte:fragment slot="title">관심 스페이스</svelte:fragment>

  <form class="relative h-11.5 w-full mb-4" on:submit|preventDefault>
    <input
      class="rounded-2.5 h-11.5 w-full bg-primary py-1.75 pr-3.5 pl-11 w-full border border-bg-primary transition focus-within:border-tertiary!"
      type="text"
      on:input={(e) => (query = e.currentTarget.value.trim())}
    />
    <div class="absolute inset-y-0 left-3.5 flex center text-secondary h-100%">
      <span class="i-lc-search square-5 transition" />
    </div>
  </form>

  <ul class="space-y-4">
    {#each followedSpaces.filter((space) => space.name.includes(query)) as space (space.id)}
      <li class="flex items-center justify-between">
        <div class="flex gap-2 items-center truncate mr-2">
          <Image class="square-10.5 rounded-lg grow-0 shrink-0" $image={space.icon} />
          <div class="truncate">
            <p class="body-15-b truncate grow">{space.name}</p>
            <p class="body-13-m text-secondary truncate">{space.description ?? ''}</p>
          </div>
        </div>
        {#if $user.followedSpaces.find((follow) => follow.id === space.id)}
          <Button
            color="tertiary"
            size="md"
            variant="outlined"
            on:click={async () => {
              unfollowSpace({ spaceId: space.id });
              toast.success('관심 스페이스 해제되었어요');
            }}
          >
            해제
          </Button>
        {:else}
          <Button
            color="secondary"
            size="md"
            on:click={async () => {
              await followSpace({ spaceId: space.id });
              toast.success('관심 스페이스로 등록되었어요');
            }}
          >
            등록
          </Button>
        {/if}
      </li>
    {/each}
  </ul>
</Modal>
