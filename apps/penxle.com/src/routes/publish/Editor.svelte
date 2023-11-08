<script lang="ts">
  import { computePosition, flip, offset, shift } from '@floating-ui/dom';
  import { writable } from '@svelte-kits/store';
  import { isTextSelection } from '@tiptap/core';
  import { tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import { focused, hover, portal } from '$lib/svelte/actions';
  import { TiptapBubbleMenu, TiptapEditor, TiptapFloatingMenu } from '$lib/tiptap/components';
  import type { Editor, JSONContent } from '@tiptap/core';

  export let title: string;
  export let subtitle: string;
  export let content: JSONContent;
  export let editor: Editor;

  let targetEl: HTMLButtonElement;
  let menuEl: HTMLDivElement;

  let open = false;
  let enableSubtitle = false;
  let enableCoverImage = false;

  const focusing = writable(false);
  const hovered = writable(false);

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

  $: if (!menuEl) {
    open = false;
  }
</script>

{#if enableCoverImage}
  <div class="relative mx-auto w-4xl">
    <img class="aspect-2/1 w-full rounded object-cover" alt="" src="https://picsum.photos/1200/600" />

    <button
      class="absolute right-2 top-2 square-8 flex center rounded-full bg-black/25 transition hover:bg-black/50"
      tabindex="-1"
      type="button"
      on:click={() => (enableCoverImage = false)}
    >
      <span class="i-lc-x square-4 text-white" />
    </button>
  </div>
{/if}

<div class="pt-12" use:hover={hovered}>
  <div class="mx-auto w-3xl">
    <div class="relative">
      <input
        class="mt-2 w-full text-3xl font-semibold"
        placeholder="제목을 입력하세요."
        type="text"
        bind:value={title}
        use:focused={focusing}
      />

      {#if enableSubtitle}
        <input
          class="mt-2 w-full text-lg"
          placeholder="부제목을 입력하세요."
          type="text"
          bind:value={subtitle}
          on:keydown={(e) => {
            if (e.key === 'Backspace' && e.currentTarget.value === '') {
              enableSubtitle = false;
            }
          }}
        />
      {/if}

      {#if $focusing || $hovered}
        <div class="absolute flex items-center -top-1 -translate-y-full" transition:fade={{ duration: 100 }}>
          {#if !enableCoverImage}
            <button
              class="flex items-center gap-1 rounded px-1 py-0.5 text-sm text-gray-50 transition hover:bg-gray-10"
              tabindex="-1"
              type="button"
              on:click={() => (enableCoverImage = true)}
            >
              <span class="i-lc-image" />
              커버 이미지 추가
            </button>
          {/if}

          {#if !enableSubtitle}
            <button
              class="flex items-center gap-1 rounded px-1 py-0.5 text-sm text-gray-50 transition hover:bg-gray-10"
              tabindex="-1"
              type="button"
              on:click={() => (enableSubtitle = true)}
            >
              <span class="i-lc-corner-down-right" />
              부제목 추가
            </button>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

<div class="mx-auto w-3xl flex grow">
  <TiptapEditor class="mt-4 max-w-full grow whitespace-pre-wrap" bind:editor bind:content />
</div>

{#if editor}
  <TiptapBubbleMenu {editor} when={(view) => isTextSelection(view.state.selection)}>
    <div class="rounded bg-gray-90 px-4 py-2 text-xs font-semibold text-white">
      <button class="i-lc-bold" type="button" on:click={() => editor.chain().focus().toggleBold().run()} />
    </div>
  </TiptapBubbleMenu>

  <TiptapFloatingMenu {editor}>
    <button
      bind:this={targetEl}
      class="border rounded-full square-10 flex center"
      type="button"
      on:click={() => {
        open = true;
      }}
    >
      <span class="i-lc-plus square-6 text-gray-50" />
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
        class="absolute rounded bg-white drop-shadow-xl px-4 py-2 text-xs font-semibold z-50"
        use:portal
      >
        <button class="flex gap-2" type="button" on:click={() => editor.chain().focus().setAccessBarrier().run()}>
          <span class="i-lc-circle-dollar-sign square-4" />
          결제선 추가
        </button>
      </div>
    {/if}
  </TiptapFloatingMenu>
{/if}
