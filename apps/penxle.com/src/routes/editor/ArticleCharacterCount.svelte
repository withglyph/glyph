<script lang="ts">
  import { flip, offset, shift } from '@floating-ui/dom';
  import { tick } from 'svelte';
  import { writable } from 'svelte/store';
  import { scale } from 'svelte/transition';
  import { hover, portal } from '$lib/svelte/actions';
  import { arrow, createFloatingActions } from '$lib/svelte-floating-ui';
  import type { Editor } from '@tiptap/core';

  export let editor: Editor | undefined;

  const arrowRef = writable<HTMLElement | null>(null);
  const hovered = writable(false);

  const [floatingRef, floatingContent, update] = createFloatingActions({
    strategy: 'absolute',
    placement: 'bottom',
    middleware: [offset(8), flip(), shift({ padding: 8 }), arrow({ element: arrowRef })],
    onComputed({ placement, middlewareData }) {
      if (!middlewareData.arrow) throw new Error('arrow middleware is not registered');

      const { x, y } = middlewareData.arrow;
      const staticSide = {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right',
      }[placement.split('-')[0]];

      if (!staticSide) throw new Error('invalid placement');
      if (!$arrowRef) return;

      Object.assign($arrowRef.style, {
        left: x == null ? '' : `${x}px`,
        top: y == null ? '' : `${y}px`,
        [staticSide]: '-0.25rem',
      });
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

<div class="body-15-b w-fit" use:floatingRef use:hover={hovered}>
  <mark class="text-blue-50">{countWithWhitespace}</mark>
  자
</div>

{#if $hovered}
  <div
    class="z-100 rounded px-3 py-2 shadow-[0_2px_10px_0_rgba(0,0,0,0.10)] bg-cardprimary text-primary"
    role="tooltip"
    use:floatingContent
    use:portal
    transition:scale={{ start: 0.9, duration: 200 }}
  >
    <div class="caption-12-m">
      <span class="text-secondary w-17.5 inline-block">공백 미포함</span>
      <span class="text-rights">{countWithoutWhitespace}자</span>
    </div>
    <div class="caption-12-m">
      <span class="text-secondary w-17.5 inline-block">공백 포함</span>
      <span class="text-rights">{countWithWhitespace}자</span>
    </div>

    <div bind:this={$arrowRef} class="absolute square-2 rotate-45 bg-cardprimary" />
  </div>
{/if}
