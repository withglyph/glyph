<script lang="ts">
  import { writable } from 'svelte/store';
  import { scale } from 'svelte/transition';
  import { createFloatingActions, hover } from '$lib/svelte/actions';
  import type { Editor } from '@tiptap/core';

  export let editor: Editor | undefined;

  const hovered = writable(false);

  const { anchor, floating, arrow } = createFloatingActions({
    placement: 'bottom-end',
    offset: 32,
    arrow: true,
  });

  $: doc = editor?.state.doc;
  $: text = doc?.textBetween(0, doc.content.size);
  $: countWithWhitespace = text?.length ?? 0;
  $: countWithoutWhitespace = text?.replaceAll(/\s/g, '').length ?? 0;
</script>

<div class="text-11-m w-fit" use:anchor use:hover={hovered}>
  {countWithWhitespace}자
</div>

{#if $hovered}
  <div
    class="z-100 rounded px-4 py-3 bg-gray-950 text-gray-300"
    role="tooltip"
    use:floating
    transition:scale={{ start: 0.9, duration: 200 }}
  >
    <div class="text-12-r">
      <span class="text-gray-300 w-15 inline-block">공백 미포함</span>
      <span class="text-right text-12-m text-white">{countWithoutWhitespace}자</span>
    </div>
    <div class="text-12-r">
      <span class="text-gray-300 w-15 inline-block">공백 포함</span>
      <span class="text-right text-12-m text-white">{countWithWhitespace}자</span>
    </div>

    <div class="square-2 bg-gray-950" use:arrow />
  </div>
{/if}
