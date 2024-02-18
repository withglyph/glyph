<script lang="ts">
  import { Link } from '@penxle/ui';
  import { afterNavigate } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Avatar } from '$lib/components';
  import { createFloatingActions, portal } from '$lib/svelte/actions';
  import GotoSpaceModal from './GotoSpaceModal.svelte';
  import type { DefaultLayout_UserMenu_user } from '$glitch';

  let _user: DefaultLayout_UserMenu_user;
  export { _user as $user };

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

  const logoutUser = graphql(`
    mutation DefaultLayout_UserMenu_LogoutUser_Mutation {
      logoutUser
    }
  `);

  const { anchor, floating } = createFloatingActions({
    placement: 'bottom-end',
    offset: 4,
  });

  afterNavigate(() => {
    open = false;
  });
</script>

<button
  class="flex center square-10 border border-gray-30 rounded-full"
  tabindex="-1"
  type="button"
  on:click={() => (open = true)}
  use:anchor
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

  <div class="z-50 w-64 flex flex-col border rounded bg-white py-2 shadow" use:floating>
    <a class="flex items-center gap-2 px-4 py-2" href="/me/cabinets">
      <Avatar class="square-10" $profile={$user.profile} />
      <div class="flex flex-col">
        <div class="font-medium">
          {$user.profile.name}
        </div>
      </div>
    </a>

    <hr class="my-2" />

    <button
      class="flex select-none items-center justify-stretch gap-2 rounded px-4 py-2 text-gray-60 hover:(bg-gray-10 text-gray-70)"
      type="button"
      on:click={() => {
        open = false;
        openGotoSpace = true;
      }}
    >
      <i class="i-lc-box" />
      내 스페이스
    </button>

    <a
      class="flex select-none items-center justify-stretch gap-2 rounded px-4 py-2 text-gray-60 hover:(bg-gray-10 text-gray-70)"
      href="/point"
    >
      <i class="i-lc-badge-dollar-sign" />
      포인트
    </a>

    <a
      class="flex select-none items-center justify-stretch gap-2 rounded px-4 py-2 text-gray-60 hover:(bg-gray-10 text-gray-70)"
      href="/me/settings"
    >
      <i class="i-lc-settings" />
      설정
    </a>

    <Link
      class="flex select-none items-center justify-stretch gap-2 rounded px-4 py-2 text-gray-60 hover:(bg-gray-10 text-gray-70)"
      href="https://penxle.nolt.io"
    >
      <i class="i-lc-lightbulb" />
      펜슬로그 피드백하기
    </Link>

    <button
      class="flex select-none items-center justify-stretch gap-2 rounded px-4 py-2 text-gray-60 hover:(bg-gray-10 text-gray-70)"
      tabindex="-1"
      type="button"
      on:click={async () => {
        await logoutUser();
        mixpanel.track('user:logout');
        mixpanel.reset();
        location.href = '/';
      }}
    >
      <i class="i-lc-log-out" />
      로그아웃
    </button>
  </div>
{/if}

<GotoSpaceModal {$user} bind:open={openGotoSpace} />
