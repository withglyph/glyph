<script lang="ts">
  import { computePosition, flip, offset, shift } from '@floating-ui/dom';
  import { tick } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Avatar } from '$lib/components';
  import { portal } from '$lib/svelte/actions';
  import GotoSpaceModal from './GotoSpaceModal.svelte';
  import type { DefaultLayout_UserMenu_user } from '$glitch';

  let _user: DefaultLayout_UserMenu_user;
  export { _user as $user };

  let targetEl: HTMLButtonElement;
  let menuEl: HTMLDivElement;

  let open = false;
  let openGotoSpace = false;

  $: user = fragment(
    _user,
    graphql(`
      fragment DefaultLayout_UserMenu_user on User {
        id

        profile {
          id
          name
          ...Avatar_profile
        }

        ...DefaultLayout_GotoSpaceModal_user
      }
    `),
  );

  const logout = graphql(`
    mutation DefaultLayout_UserMenu_Logout_Mutation {
      logout
    }
  `);

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
  class="flex center square-10 border border-gray-30 rounded-full"
  tabindex="-1"
  type="button"
  on:click={() => (open = true)}
>
  <Avatar class="square-9" $profile={$user.profile} />
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

  <div bind:this={menuEl} class="absolute z-50 w-64 flex flex-col border rounded bg-white py-2 shadow" use:portal>
    <a class="flex items-center gap-2 px-4 py-2" href="/me/preferences">
      <Avatar class="square-10" $profile={$user.profile} />
      <div class="flex flex-col">
        <div class="font-medium">
          {$user.profile.name}
        </div>
      </div>
    </a>

    <hr class="my-2" />

    <button
      class="flex select-none items-center justify-stretch gap-2 rounded px-4 py-2 text-gray-50 hover:(bg-gray-10 text-gray-70)"
      type="button"
      on:click={() => {
        open = false;
        openGotoSpace = true;
      }}
    >
      <span class="i-lc-box" />
      내 스페이스
    </button>

    <a
      class="flex select-none items-center justify-stretch gap-2 rounded px-4 py-2 text-gray-50 hover:(bg-gray-10 text-gray-70)"
      href="/me/accounts"
    >
      <span class="i-lc-settings" />
      설정
    </a>

    <button
      class="flex select-none items-center justify-stretch gap-2 rounded px-4 py-2 text-gray-50 hover:(bg-gray-10 text-gray-70)"
      tabindex="-1"
      type="button"
      on:click={async () => {
        await logout();
        mixpanel.track('user:logout');
        mixpanel.reset();
        location.href = '/';
      }}
    >
      <span class="i-lc-log-out" />
      로그아웃
    </button>
  </div>
{/if}

<GotoSpaceModal {$user} bind:open={openGotoSpace} />
