<script lang="ts">
  import { computePosition, flip, offset, shift } from '@floating-ui/dom';
  import { tick } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { portal } from '$lib/svelte/actions';
  import ColorPaletteButton from './ColorPaletteButton.svelte';
  import ToolbarButton from './ToolbarButton.svelte';
  import type { Editor } from '@tiptap/core';

  export let editor: Editor | undefined;
  let targetEl: HTMLButtonElement;
  let menuEl: HTMLDivElement;

  let open = false;

  let _class: string;
  export { _class as class };
  export let name: string;
  export let active = false;
  export let enabled = true;

  const update = async () => {
    await tick();

    const position = await computePosition(targetEl, menuEl, {
      placement: 'top-end',
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

  afterNavigate(() => {
    open = false;
  });
</script>

<svelte:element this="button" tabindex="-1" bind:this={targetEl}>
  <ToolbarButton
    {name}
    class={_class}
    {active}
    {enabled}
    on:click={() => (open = true)}
  />
</svelte:element>

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
    class="absolute z-50 w-64 flex flex-col border rounded bg-white py-2 shadow"
    use:portal
  >
    <ColorPaletteButton
      class="bg-brand-50"
      active={editor?.getAttributes('color')?.['data-color'] ===
        'text-brand-50'}
      enabled={editor?.can().setColor({ 'data-color': 'text-brand-50' })}
      on:click={() => {
        open = false;

        return editor
          ?.chain()
          .focus()
          .setColor({ 'data-color': 'text-brand-50' })
          .run();
      }}
    />

    <ColorPaletteButton
      class="bg-gray-90"
      active={!editor?.isActive('color')}
      enabled={editor?.can().unsetColor()}
      on:click={() => {
        open = false;

        return editor?.chain().focus().unsetColor().run();
      }}
    />
  </div>
{/if}
