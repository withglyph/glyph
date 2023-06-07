<script lang="ts">
  import Tiptap from './Tiptap.svelte';
  import type { Editor } from '@tiptap/core';

  export let editor: Editor | undefined;
</script>

<div class="mx-auto max-w-3xl w-full flex grow flex-col">
  <input
    class="mt-12 w-full text-3xl font-semibold"
    placeholder="제목을 입력하세요."
    type="text"
  />

  <input
    class="mt-2 w-full text-lg"
    placeholder="부제목을 입력하세요."
    type="text"
  />

  <hr class="mb-4 mt-8" />

  <Tiptap bind:editor />
</div>
