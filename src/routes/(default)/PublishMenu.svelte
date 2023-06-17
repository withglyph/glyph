<script lang="ts">
  import { computePosition, flip, offset, shift } from '@floating-ui/dom';
  import { tick } from 'svelte';
  import { fragment, graphql } from '$houdini';
  import { portal } from '$lib/svelte/actions';
  import CreateSpaceModal from './CreateSpaceModal.svelte';
  import PublishModal from './PublishModal.svelte';
  import type { DefaultLayout_PublishMenu_profile } from '$houdini';

  let _profile: DefaultLayout_PublishMenu_profile;
  export { _profile as $profile };

  let targetEl: HTMLButtonElement;
  let menuEl: HTMLDivElement;

  let open = false;
  let openCreateSpace = false;
  let openPublish = false;

  let publishType: 'artwork' | 'post';

  $: profile = fragment(
    _profile,
    graphql(`
      fragment DefaultLayout_PublishMenu_profile on Profile {
        ...DefaultLayout_PublishModal_profile
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
</script>

<button
  bind:this={targetEl}
  class="relative flex items-center gap-2 rounded-full from-cyan-500 via-brand-500 to-violet-500 bg-gradient-to-rb px-4 py-2 font-medium text-white transition before:(absolute inset-0 rounded-full bg-brand-500 opacity-0 transition content-empty hover:opacity-100)"
  tabindex="-1"
  type="button"
  on:click={() => (open = true)}
>
  <span class="z-1 text-sm">올리기</span>
  <span class="i-lc-pencil z-1 square-4" />
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
    class="absolute z-50 w-80 flex flex-col border rounded bg-white py-2 shadow"
    use:portal
  >
    <button
      class="group flex items-center gap-4 px-4 py-2 hover:bg-gray-100"
      tabindex="-1"
      type="button"
      on:click={() => {
        publishType = 'post';
        open = false;
        openPublish = true;
      }}
    >
      <div
        class="square-12 flex center rounded-xl bg-gray-100 group-hover:bg-gray-200"
      >
        <span class="i-lc-wrap-text square-6 text-gray-500" />
      </div>
      <div class="flex flex-col">
        <div class="font-bold">글</div>
        <div class="text-sm text-gray-500">
          새로운 글을 스페이스에 작성해요.
        </div>
      </div>
    </button>

    <button
      class="group flex items-center gap-4 px-4 py-2 hover:bg-gray-100"
      tabindex="-1"
      type="button"
      on:click={() => {
        publishType = 'artwork';
        open = false;
        openPublish = true;
      }}
    >
      <div
        class="square-12 flex center rounded-xl bg-gray-100 group-hover:bg-gray-200"
      >
        <span class="i-lc-image square-6 text-gray-500" />
      </div>
      <div class="flex flex-col">
        <div class="font-bold">그림</div>
        <div class="text-sm text-gray-500">
          새로운 그림을 스페이스에 업로드해요.
        </div>
      </div>
    </button>

    <hr class="my-2" />

    <button
      class="group flex items-center gap-4 px-4 py-2 hover:bg-gray-100"
      tabindex="-1"
      type="button"
      on:click={() => {
        open = false;
        openCreateSpace = true;
      }}
    >
      <div
        class="square-12 flex center rounded-xl bg-gray-100 group-hover:bg-gray-200"
      >
        <span class="i-lc-box square-6 text-gray-500" />
      </div>
      <div class="flex flex-col">
        <div class="font-bold">스페이스</div>
        <div class="text-sm text-gray-500">새 스페이스를 만들어요.</div>
      </div>
    </button>
  </div>
{/if}

<CreateSpaceModal bind:open={openCreateSpace} />
<PublishModal {$profile} type={publishType} bind:open={openPublish} />
