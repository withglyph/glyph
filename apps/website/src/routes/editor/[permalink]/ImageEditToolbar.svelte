<script lang="ts">
  import IconEmbedCompact from '~icons/glyph/embed-compact';
  import IconEmbedFull from '~icons/glyph/embed-full';
  import IconAlignCenter from '~icons/tabler/align-center';
  import IconAlignLeft from '~icons/tabler/align-left';
  import IconAlignRight from '~icons/tabler/align-right';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import { getEditorContext } from './context';
  import SpecialToolbarButton from './SpecialToolbarButton.svelte';

  const { state } = getEditorContext();
  $: editor = $state.editor;
</script>

<!-- <hr class={css({ border: 'none', width: '1px', height: '12px', backgroundColor: '[#DAD7E2]' })} />

<button
  class={flex({
    align: 'center',
    gap: '2px',
    padding: '2px',
    fontSize: '12px',
    fontWeight: 'medium',
    color: 'gray.600',
  })}
  type="button"
>
  <Icon icon={IconArrowsExchange} size={20} />
  이미지 교체
</button> -->

<hr class={css({ border: 'none', width: '1px', height: '12px', backgroundColor: '[#DAD7E2]' })} />

<div class={flex({ align: 'center', gap: '6px' })}>
  <SpecialToolbarButton
    aria-pressed={editor?.isActive('image', { size: 'full' })}
    icon={IconEmbedFull}
    on:click={() => editor?.commands.updateAttributes('image', { size: 'full' })}
  />
  <SpecialToolbarButton
    aria-pressed={editor?.isActive('image', { size: 'compact' })}
    icon={IconEmbedCompact}
    on:click={() => editor?.commands.updateAttributes('image', { size: 'compact' })}
  />
</div>

{#if editor?.isActive('image', { size: 'compact' })}
  <hr class={css({ border: 'none', width: '1px', height: '12px', backgroundColor: '[#DAD7E2]' })} />

  <div class={flex({ align: 'center', gap: '6px' })}>
    <SpecialToolbarButton
      aria-pressed={editor?.isActive('image', { align: 'left' })}
      icon={IconAlignLeft}
      on:click={() => editor.commands.updateAttributes('image', { align: 'left' })}
    />
    <SpecialToolbarButton
      aria-pressed={editor?.isActive('image', { align: 'center' })}
      icon={IconAlignCenter}
      on:click={() => editor.commands.updateAttributes('image', { align: 'center' })}
    />
    <SpecialToolbarButton
      aria-pressed={editor?.isActive('image', { align: 'right' })}
      icon={IconAlignRight}
      on:click={() => editor.commands.updateAttributes('image', { align: 'right' })}
    />
  </div>
{/if}
