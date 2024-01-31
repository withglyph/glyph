<script lang="ts">
  import { flip, offset, shift } from '@floating-ui/dom';
  import { tick } from 'svelte';
  import { writable } from 'svelte/store';
  import { scale } from 'svelte/transition';
  import { hover, portal } from '$lib/svelte/actions';
  import { arrow, computeArrowPosition, createFloatingActions } from '$lib/svelte-floating-ui';
  import type { Editor } from '@tiptap/core';

  export let editor: Editor | undefined;

  const arrowRef = writable<HTMLElement | null>(null);
  const hovered = writable(false);

  const [floatingRef, floatingContent, update] = createFloatingActions({
    strategy: 'absolute',
    placement: 'bottom-start',
    middleware: [offset(32), flip(), shift({ padding: 8 }), arrow({ element: arrowRef })],
    onComputed(position) {
      if ($arrowRef) {
        Object.assign($arrowRef.style, computeArrowPosition(position));
      }
    },
  });

  $: if ($hovered) {
    // eslint-disable-next-line unicorn/prefer-top-level-await
    void tick().then(() => update());
  }

  $: doc = editor?.state.doc;
  $: text = doc?.textBetween(0, doc.content.size);
  $: countWithWhitespace = text?.length ?? 0;
  $: countWithoutWhitespace = text?.replaceAll(/\s/g, '').length ?? 0;
</script>

<div class="text-11-m w-fit" use:floatingRef use:hover={hovered}>
  {countWithWhitespace}자
</div>

{#if $hovered}
  <div
    class="z-100 rounded px-4 py-3 bg-gray-950 text-gray-300"
    role="tooltip"
    use:floatingContent
    use:portal
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

    <div bind:this={$arrowRef} class="absolute square-2 rotate-45 bg-gray-950" />
  </div>
{/if}
