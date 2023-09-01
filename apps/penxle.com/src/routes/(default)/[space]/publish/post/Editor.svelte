<script lang="ts">
  import { writable } from '@svelte-kits/store';
  import { fade } from 'svelte/transition';
  import { focused, hover } from '$lib/svelte/actions';
  import Tiptap from './Tiptap.svelte';
  import type { Editor } from '@tiptap/core';

  export let editor: Editor | undefined;

  let enableSubtitle = false;
  let enableCoverImage = false;

  const focusing = writable(false);
  const hovered = writable(false);
</script>

{#if enableCoverImage}
  <div class="relative mx-auto w-4xl">
    <img
      class="aspect-2/1 w-full rounded object-cover"
      alt=""
      src="https://picsum.photos/1200/600"
    />

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
        use:focused={focusing}
      />

      {#if enableSubtitle}
        <input
          class="mt-2 w-full text-lg"
          placeholder="부제목을 입력하세요."
          type="text"
          on:keydown={(e) => {
            if (e.key === 'Backspace' && e.currentTarget.value === '') {
              enableSubtitle = false;
            }
          }}
        />
      {/if}

      {#if $focusing || $hovered}
        <div
          class="absolute flex items-center -top-1 -translate-y-full"
          transition:fade={{ duration: 100 }}
        >
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

<!-- <hr class="mb-4 mt-8" /> -->

<div class="mx-auto w-3xl flex grow">
  <Tiptap
    class="font-content-sans mt-4 max-w-full grow whitespace-pre-wrap"
    bind:editor
  />
</div>
