<script lang="ts">
  import clsx from 'clsx';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Image, Modal } from '$lib/components';
  import { PopupSearch } from '$lib/components/forms';
  import { toast } from '$lib/notification';
  import type { MeSettingsContentFiltersPage_MutedSpaceModal_user } from '$glitch';

  let _user: MeSettingsContentFiltersPage_MutedSpaceModal_user;
  export { _user as $user };
  export let open = false;

  let mutedSpaces: typeof $user.mutedSpaces | undefined;
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

  $: filteredSpaces = mutedSpaces?.filter((space) => space.name.includes(query));
</script>

<Modal size="md" bind:open>
  <svelte:fragment slot="title">숨긴 스페이스</svelte:fragment>

  <PopupSearch
    class={clsx('mb-4', mutedSpaces?.length === 0 && 'hidden')}
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
        <div class="flex gap-2 items-center truncate mr-2">
          <Image class="square-10.5 rounded-lg grow-0 shrink-0 border border-secondary" $image={space.icon} />
          <div class="truncate">
            <p class="body-15-b truncate grow">{space.name}</p>
            <p class="body-13-m text-secondary truncate">{space.description ?? ''}</p>
          </div>
        </div>
        {#if $user.mutedSpaces.find((muted) => muted.id === space.id)}
          <Button
            class="shrink-0"
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
            class="shrink-0"
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
    {:else}
      <article class="text-secondary body-16-m text-center break-keep">
        {#if mutedSpaces}
          {mutedSpaces.length === 0 ? '숨긴 스페이스가 없어요' : '일치하는 검색 결과가 없어요'}
        {/if}
      </article>
    {/each}
  </ul>
</Modal>
