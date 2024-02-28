<script lang="ts">
  import { writable } from 'svelte/store';
  import { scale } from 'svelte/transition';
  import { createFloatingActions, hover } from '$lib/svelte/actions';
  import { css } from '$styled-system/css';
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

<div class={css({ fontSize: '11px', fontWeight: 'medium', width: 'fit' })} use:anchor use:hover={hovered}>
  {countWithWhitespace}자
</div>

{#if $hovered}
  <div
    class={css({
      borderRadius: '4px',
      paddingX: '16px',
      paddingY: '12px',
      color: 'gray.300',
      backgroundColor: 'gray.950',
      zIndex: '50',
    })}
    role="tooltip"
    use:floating
    transition:scale={{ start: 0.9, duration: 200 }}
  >
    <div class={css({ fontSize: '12px' })}>
      <span class={css({ display: 'inline-block', width: '60px', color: 'gray.300' })}>공백 미포함</span>
      <span class={css({ textAlign: 'right', fontSize: '12px', fontWeight: 'medium', color: 'white' })}>
        {countWithoutWhitespace}자
      </span>
    </div>
    <div class={css({ fontSize: '12px' })}>
      <span class={css({ display: 'inline-block', width: '60px', color: 'gray.300' })}>공백 포함</span>
      <span class={css({ textAlign: 'right', fontSize: '12px', fontWeight: 'medium', color: 'white' })}>
        {countWithWhitespace}자
      </span>
    </div>

    <div class={css({ size: '8px', backgroundColor: 'gray.950' })} use:arrow />
  </div>
{/if}
