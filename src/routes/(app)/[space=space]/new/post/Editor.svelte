<script lang="ts">
  import { writable } from '@svelte-kits/store';
  import { fade } from 'svelte/transition';
  import { focused, hover } from '$lib/svelte/actions';
  import Tiptap from './Tiptap.svelte';
  import type { Editor } from '@tiptap/core';

  export let editor: Editor | undefined;

  let enableSubtitle = false;

  const focusing = writable(false);
  const hovered = writable(false);
</script>

<div class="pt-12" use:hover={hovered}>
  <div class="mx-auto max-w-3xl w-full">
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
          <button
            class="flex items-center gap-1 rounded px-1 py-0.5 text-sm text-gray-500 transition hover:bg-gray-100"
            type="button"
          >
            <span class="i-lc-image" />
            커버 이미지 추가
          </button>

          {#if !enableSubtitle}
            <button
              class="flex items-center gap-1 rounded px-1 py-0.5 text-sm text-gray-500 transition hover:bg-gray-100"
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

<div class="mx-auto max-w-3xl w-full flex grow">
  <Tiptap bind:editor />
</div>
