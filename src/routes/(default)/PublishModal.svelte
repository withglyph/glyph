<script lang="ts">
  import { fragment, graphql } from '$houdini';
  import { Button, Modal } from '$lib/components';
  import { absolutePath } from '$lib/utils';
  import CreateSpaceModal from './CreateSpaceModal.svelte';
  import type { DefaultLayout_PublishModal_profile } from '$houdini';

  let _profile: DefaultLayout_PublishModal_profile;
  export { _profile as $profile };

  export let open = false;
  export let type: 'artwork' | 'post';
  let openCreateSpace = false;

  $: profile = fragment(
    _profile,
    graphql(`
      fragment DefaultLayout_PublishModal_profile on Profile {
        spaces {
          id
          slug
          name
        }
      }
    `)
  );
</script>

<Modal bind:open>
  <svelte:fragment slot="title">게시할 스페이스 선택</svelte:fragment>

  <div class="flex flex-col">
    {#each $profile.spaces as space (space.id)}
      <a
        class="group flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100"
        href={`/${space.slug}/publish/${type}`}
      >
        <div class="flex flex-col">
          <div class="font-medium">{space.name}</div>
          <div class="text-sm text-gray-500">{absolutePath(space.slug)}</div>
        </div>
        <div class="grow" />
        <div class="hidden text-sm text-gray-500 group-hover:block">
          선택하기
        </div>
      </a>
    {/each}

    <button
      class="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
      type="button"
      on:click={() => {
        open = false;
        openCreateSpace = true;
      }}
    >
      <div
        class="square-10 flex center border border-gray-400 rounded-full border-dashed"
      >
        <span class="i-lc-plus square-5 text-gray-400" />
      </div>
      <div class="text-gray-400">새 스페이스 만들기</div>
    </button>
  </div>

  <Button slot="action" on:click={() => (open = false)}>닫기</Button>
</Modal>

<CreateSpaceModal bind:open={openCreateSpace} />
