<script lang="ts">
  import { computePosition, flip, offset, shift } from '@floating-ui/dom';
  import { tick } from 'svelte';
  import { afterNavigate, goto } from '$app/navigation';
  import { fragment, graphql } from '$houdini';
  import { Avatar } from '$lib/components';
  import { useMutation } from '$lib/houdini';
  import { portal } from '$lib/svelte/actions';
  import GotoSpaceModal from './GotoSpaceModal.svelte';
  import SwitchProfileModal from './SwitchProfileModal.svelte';
  import type { DefaultLayout_UserMenu_profile } from '$houdini';

  let _profile: DefaultLayout_UserMenu_profile;
  export { _profile as $profile };

  let targetEl: HTMLButtonElement;
  let menuEl: HTMLDivElement;

  let open = false;
  let openGotoSpace = false;
  let openSwitchProfile = false;

  $: profile = fragment(
    _profile,
    graphql(`
      fragment DefaultLayout_UserMenu_profile on Profile {
        id
        name
        handle

        ...Avatar_profile
        ...DefaultLayout_GotoSpaceModal_profile
        ...DefaultLayout_SwitchProfileModal_profile
      }
    `)
  );

  const logout = useMutation(
    graphql(`
      mutation DefaultLayout_UserMenu_Logout_Mutation {
        logout
      }
    `)
  );

  const update = async () => {
    await tick();

    const position = await computePosition(targetEl, menuEl, {
      placement: 'bottom-end',
      middleware: [offset(4), flip(), shift({ padding: 8 })],
    });

    Object.assign(menuEl.style, {
      left: `${position.x}px`,
      top: `${position.y}px`,
    });
  };

  $: if (open) {
    void update();
  }

  afterNavigate(() => {
    open = false;
  });
</script>

<button
  bind:this={targetEl}
  class="flex center"
  tabindex="-1"
  type="button"
  on:click={() => (open = true)}
>
  <Avatar class="square-8" {$profile} />
</button>

{#if open}
  <div
    class="fixed inset-0 z-49"
    role="button"
    tabindex="-1"
    on:click={() => (open = false)}
    on:keypress={null}
    use:portal
  />

  <div
    bind:this={menuEl}
    class="absolute z-50 w-64 flex flex-col border rounded bg-white py-2 shadow"
    use:portal
  >
    <a class="flex items-center gap-2 px-4 py-2" href={`/@${$profile.handle}`}>
      <Avatar class="square-10" {$profile} />
      <div class="flex flex-col">
        <div class="font-medium">
          {$profile.name}
        </div>
        <div class="text-sm text-gray-500">
          @{$profile.handle}
        </div>
      </div>
    </a>

    <hr class="my-2" />

    <button
      class="flex select-none items-center justify-stretch gap-2 rounded px-4 py-2 text-gray-500 hover:(bg-gray-100 text-gray-700)"
      type="button"
      on:click={() => {
        open = false;
        openGotoSpace = true;
      }}
    >
      <span class="i-lc-box" />
      내 스페이스
    </button>

    <button
      class="flex select-none items-center justify-stretch gap-2 rounded px-4 py-2 text-gray-500 hover:(bg-gray-100 text-gray-700)"
      type="button"
      on:click={() => {
        open = false;
        openSwitchProfile = true;
      }}
    >
      <span class="i-lc-users" />
      프로필 전환
    </button>

    <a
      class="flex select-none items-center justify-stretch gap-2 rounded px-4 py-2 text-gray-500 hover:(bg-gray-100 text-gray-700)"
      href="/me/settings"
    >
      <span class="i-lc-settings" />
      설정
    </a>

    <button
      class="flex select-none items-center justify-stretch gap-2 rounded px-4 py-2 text-gray-500 hover:(bg-gray-100 text-gray-700)"
      tabindex="-1"
      type="button"
      on:click={async () => {
        await logout();
        await goto('/');
      }}
    >
      <span class="i-lc-log-out" />
      로그아웃
    </button>
  </div>
{/if}

<GotoSpaceModal {$profile} bind:open={openGotoSpace} />
<SwitchProfileModal {$profile} bind:open={openSwitchProfile} />
