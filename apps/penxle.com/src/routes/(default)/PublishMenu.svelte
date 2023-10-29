<script lang="ts">
  import clsx from 'clsx';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import CreateSpaceModal from './CreateSpaceModal.svelte';
  import type { DefaultLayout_PublishMenu_user } from '$glitch';

  let _user: DefaultLayout_PublishMenu_user;
  let _class: string | undefined;
  export { _user as $user, _class as class };

  let openCreateSpace = false;

  $: user = fragment(
    _user,
    graphql(`
      fragment DefaultLayout_PublishMenu_user on User {
        id

        spaces {
          id
        }

        ...DefaultLayout_CreateSpaceModal_user
      }
    `),
  );

  const handleClick = async () => {
    if ($user.spaces.length === 0) {
      openCreateSpace = true;
      return;
    }

    await goto('/publish');
  };
</script>

<button
  class={clsx(
    'relative flex items-center gap-2 rounded-lg py-1 px-2 font-bold text-gray-60 transition hover:bg-surface-primary',
    _class,
  )}
  type="button"
  on:click={handleClick}
>
  <span class="i-px-pen-fill square-6 fill-gray-60" />
  <span class="text-sm">포스트 작성하기</span>
</button>

<CreateSpaceModal {$user} bind:open={openCreateSpace} />
