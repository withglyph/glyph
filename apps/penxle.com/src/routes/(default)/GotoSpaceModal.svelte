<script lang="ts">
  import { fragment, graphql } from '$glitch';
  import { Button, Modal } from '$lib/components';
  import { absolutePath } from '$lib/utils';
  import CreateSpaceModal from './CreateSpaceModal.svelte';
  import type { DefaultLayout_GotoSpaceModal_user } from '$glitch';

  export let _user: DefaultLayout_GotoSpaceModal_user;
  export let open = false;

  let openCreateSpace = false;

  $: user = fragment(
    _user,
    graphql(`
      fragment DefaultLayout_GotoSpaceModal_user on User {
        spaces {
          id
          slug
          name
        }
      }
    `),
  );
</script>

<Modal bind:open>
  <svelte:fragment slot="title">내 스페이스</svelte:fragment>

  <div class="flex flex-col">
    {#each $user.spaces as space (space.id)}
      <a
        class="group flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-10"
        href={`/${space.slug}`}
      >
        <div class="flex flex-col">
          <div class="font-medium">{space.name}</div>
          <div class="text-sm text-gray-50">{absolutePath(space.slug)}</div>
        </div>
        <div class="grow" />
        <div class="hidden text-sm text-gray-50 group-hover:block">
          바로가기
        </div>
      </a>
    {/each}

    <button
      class="flex items-center gap-2 px-4 py-2 hover:bg-gray-10"
      type="button"
      on:click={() => {
        open = false;
        openCreateSpace = true;
      }}
    >
      <div
        class="square-10 flex center border border-gray-40 rounded-full border-dashed"
      >
        <span class="i-lc-plus square-5 text-gray-40" />
      </div>
      <div class="text-gray-40">새 스페이스 만들기</div>
    </button>
  </div>

  <Button slot="action" on:click={() => (open = false)}>닫기</Button>
</Modal>

<CreateSpaceModal bind:open={openCreateSpace} />
