<script lang="ts">
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Image, Modal } from '$lib/components';
  import { toast } from '$lib/notification';
  import type { MeSettingsContentFiltersPage_MutedSpaceModal_user } from '$glitch';

  let _user: MeSettingsContentFiltersPage_MutedSpaceModal_user;
  export { _user as $user };
  export let open = false;

  let mutedSpaces: typeof $user.mutedSpaces;
  let query = '';

  const setSpaces = () => {
    mutedSpaces = $user.mutedSpaces;
  };

  $: if (open) {
    setSpaces();
  }

  $: user = fragment(
    _user,
    graphql(`
      fragment MeSettingsContentFiltersPage_MutedSpaceModal_user on User {
        id

        mutedSpaces {
          id
          name
          description
          muted

          icon {
            id
            ...Image_image
          }
        }
      }
    `),
  );

  const muteSpace = graphql(`
    mutation MeSettingsContentFiltersPage_MuteSpace_Mutation($input: MuteSpaceInput!) {
      muteSpace(input: $input) {
        id
        muted
      }
    }
  `);

  const unmuteSpace = graphql(`
    mutation MeSettingsContentFiltersPage_UnmuteSpace_Mutation($input: UnmuteSpaceInput!) {
      unmuteSpace(input: $input) {
        id
        muted
      }
    }
  `);
</script>

<Modal size="md" bind:open>
  <svelte:fragment slot="title">숨긴 스페이스</svelte:fragment>

  <form class="relative h-11.5 w-full mb-4" on:submit|preventDefault>
    <input
      class="rounded-2.5 h-11.5 w-full bg-primary py-1.75 pr-3.5 pl-11 w-full border border-bg-primary transition focus-within:border-tertiary!"
      type="text"
      on:input={(e) => (query = e.currentTarget.value.trim())}
    />
    <div class="absolute inset-y-0 left-3.5 flex center text-secondary h-100%">
      <i class="i-lc-search square-5 transition" />
    </div>
  </form>

  <ul class="space-y-4">
    {#each mutedSpaces.filter((space) => space.name.includes(query)) as space (space.id)}
      <li class="flex items-center justify-between">
        <div class="flex gap-2 items-center truncate mr-2">
          <Image class="square-10.5 rounded-lg grow-0 shrink-0 border border-secondary" $image={space.icon} />
          <div class="truncate">
            <p class="body-15-b truncate grow">{space.name}</p>
            <p class="body-13-m text-secondary truncate">{space.description ?? ''}</p>
          </div>
        </div>
        {#if $user.mutedSpaces.find((muted) => muted.id === space.id)}
          <Button
            color="tertiary"
            size="md"
            variant="outlined"
            on:click={async () => {
              await unmuteSpace({ spaceId: space.id });
              mixpanel.track('space:unmute', { spaceId: space.id, via: 'content-filters' });
              toast.success('스페이스 숨기기를 해제했어요');
            }}
          >
            해제
          </Button>
        {:else}
          <Button
            color="secondary"
            size="md"
            on:click={async () => {
              await muteSpace({ spaceId: space.id });
              mixpanel.track('space:mute', { spaceId: space.id, via: 'content-filters' });
              toast.success('스페이스를 숨겼어요');
            }}
          >
            등록
          </Button>
        {/if}
      </li>
    {/each}
  </ul>
</Modal>
