<script lang="ts">
  import { computePosition, flip, offset, shift } from '@floating-ui/dom';
  import { tick } from 'svelte';
  import { fragment, graphql } from '$houdini';
  import { Avatar } from '$lib/components';
  import { refreshAll } from '$lib/houdini';
  import { portal } from '$lib/svelte/actions';
  import type { AppLayout_UserMenu_profile } from '$houdini';

  let _profile: AppLayout_UserMenu_profile;
  export { _profile as $profile };

  let targetEl: HTMLButtonElement;
  let menuEl: HTMLDivElement;

  let open = false;

  $: profile = fragment(
    _profile,
    graphql(`
      fragment AppLayout_UserMenu_profile on Profile {
        name
      }
    `)
  );

  const logout = graphql(`
    mutation AppLayout_UserMenu_Logout_Mutation {
      logout
    }
  `);

  const handleLogout = async () => {
    await logout.mutate(null);
    await refreshAll();
  };

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
</script>

<button
  bind:this={targetEl}
  class="flex center"
  type="button"
  on:click={() => (open = true)}
>
  <Avatar class="square-8" src="https://picsum.photos/512/512" />
</button>

{#if open}
  <div class="fixed inset-0" on:click={() => (open = false)} use:portal />

  <div
    bind:this={menuEl}
    class="absolute w-60 flex flex-col border rounded bg-white py-2 shadow"
    use:portal
  >
    <div class="px-4 py-2">
      <div class="font-medium">
        {$profile.name}
      </div>
      <!-- <div class="mt-1 text-sm text-gray-500">
        @{$profile.handle}
      </div> -->
    </div>

    <hr class="mx-4 my-2" />

    <!-- <a class="menu-item" href={`/u/${$profile.handle}`}>
      <span class="i-lc-user" />
      내 프로필
    </a> -->

    <a class="menu-item" href="/profile/switch">
      <span class="i-lc-shuffle" />
      프로필 전환
    </a>

    <hr class="mx-4 my-2" />

    <a class="menu-item" href="/settings">
      <span class="i-lc-settings" />
      설정
    </a>

    <button class="menu-item" type="button" on:click={handleLogout}>
      <span class="i-lc-log-out" />
      로그아웃
    </button>
  </div>
{/if}

<style lang="scss">
  .menu-item {
    --uno: flex items-center gap-2 justify-stretch select-none rounded px-4 py-2 text-gray-500 hover:(bg-gray-100 text-gray-700);
  }
</style>
