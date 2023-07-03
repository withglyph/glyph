<script lang="ts">
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$houdini';
  import { Avatar, Button, Modal } from '$lib/components';
  import { useMutation } from '$lib/houdini';
  import { toast } from '$lib/notification';
  import CreateProfileModal from './CreateProfileModal.svelte';
  import type { DefaultLayout_SwitchProfileModal_profile } from '$houdini';

  export let _profile: DefaultLayout_SwitchProfileModal_profile;
  export let open = false;

  let openCreateProfile = false;

  $: profile = fragment(
    _profile,
    graphql(`
      fragment DefaultLayout_SwitchProfileModal_profile on Profile {
        id

        user {
          profiles {
            id
            name
            handle
            ...Avatar_profile
          }
        }
      }
    `)
  );

  $: profileId = $profile.id;

  const switchProfile = useMutation(
    graphql(`
      mutation DefaultLayout_SwitchProfileModal_SwitchProfile_Mutation(
        $input: SwitchProfileInput!
      ) {
        switchProfile(input: $input) {
          __typename
        }
      }
    `)
  );
</script>

<Modal bind:open>
  <svelte:fragment slot="title">프로필 전환하기</svelte:fragment>

  <div class="flex flex-col">
    {#each $profile.user.profiles as profile (profile.id)}
      <button
        class="flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100"
        type="button"
        on:click={async () => {
          await switchProfile({ profileId: profile.id });
          await goto('/');
          toast.info('프로필을 전환했어요.');
        }}
      >
        <Avatar class="square-10" _profile={profile} />
        <div class="flex flex-col">
          <div class="font-medium">{profile.name}</div>
          <div class="text-sm text-gray-500">@{profile.handle}</div>
        </div>
        <div class="grow" />
        {#if profile.id === profileId}
          <div class="text-sm text-gray-500">현재 프로필</div>
        {/if}
      </button>
    {/each}

    <button
      class="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
      type="button"
      on:click={() => {
        open = false;
        openCreateProfile = true;
      }}
    >
      <div
        class="square-10 flex center border border-gray-400 rounded-full border-dashed"
      >
        <span class="i-lc-plus square-5 text-gray-400" />
      </div>
      <div class="text-gray-400">새 프로필 만들기</div>
    </button>
  </div>

  <Button slot="action" on:click={() => (open = false)}>닫기</Button>
</Modal>

<CreateProfileModal bind:open={openCreateProfile} />
