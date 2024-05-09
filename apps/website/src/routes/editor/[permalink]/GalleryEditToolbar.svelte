<script lang="ts">
  import IconBookBothPage from '~icons/glyph/book-both-page';
  import IconBookSinglePage from '~icons/glyph/book-single-page';
  import IconContentScroll from '~icons/glyph/content-scroll';
  import IconContentSlide from '~icons/glyph/content-slide';
  import IconEmbedCompact from '~icons/glyph/embed-compact';
  import IconEmbedFull from '~icons/glyph/embed-full';
  import IconGrid from '~icons/glyph/grid';
  import IconGrid2Columns from '~icons/glyph/grid-2-columns';
  import IconGrid3Columns from '~icons/glyph/grid-3-columns';
  import IconAlignCenter from '~icons/tabler/align-center';
  import IconAlignLeft from '~icons/tabler/align-left';
  import IconAlignRight from '~icons/tabler/align-right';
  import IconEdit from '~icons/tabler/edit';
  import { Icon } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import { getEditorContext } from './context';
  import SpecialToolbarButton from './SpecialToolbarButton.svelte';

  const { state } = getEditorContext();
  $: editor = $state.editor;
</script>

<hr class={css({ border: 'none', width: '1px', height: '12px', backgroundColor: '[#DAD7E2]' })} />

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
  <Icon icon={IconEdit} size={20} />
  그룹 편집
</button>

<hr class={css({ border: 'none', width: '1px', height: '12px', backgroundColor: '[#DAD7E2]' })} />

<div class={flex({ align: 'center', gap: '6px' })}>
  <SpecialToolbarButton
    aria-pressed={editor?.isActive('gallery', { size: 'full' })}
    icon={IconEmbedFull}
    on:click={() => editor?.commands.updateAttributes('gallery', { size: 'full' })}
  />
  <SpecialToolbarButton
    aria-pressed={editor?.isActive('gallery', { size: 'compact' })}
    icon={IconEmbedCompact}
    on:click={() => editor?.commands.updateAttributes('gallery', { size: 'compact' })}
  />
</div>

{#if editor?.isActive('gallery', { size: 'compact' })}
  <hr class={css({ border: 'none', width: '1px', height: '12px', backgroundColor: '[#DAD7E2]' })} />

  <div class={flex({ align: 'center', gap: '6px' })}>
    <SpecialToolbarButton
      aria-pressed={editor?.isActive('gallery', { align: 'left' })}
      icon={IconAlignLeft}
      on:click={() => editor.commands.updateAttributes('gallery', { align: 'left' })}
    />
    <SpecialToolbarButton
      aria-pressed={editor?.isActive('gallery', { align: 'center' })}
      icon={IconAlignCenter}
      on:click={() => editor.commands.updateAttributes('gallery', { align: 'center' })}
    />
    <SpecialToolbarButton
      aria-pressed={editor?.isActive('gallery', { align: 'right' })}
      icon={IconAlignRight}
      on:click={() => editor.commands.updateAttributes('gallery', { align: 'right' })}
    />
  </div>
{/if}

<hr class={css({ border: 'none', width: '1px', height: '12px', backgroundColor: '[#DAD7E2]' })} />

<div class={flex({ align: 'center', gap: '6px' })}>
  <SpecialToolbarButton
    aria-pressed={editor?.isActive('gallery', { layout: 'scroll' })}
    icon={IconContentScroll}
    label="스크롤"
    on:click={() => editor?.commands.updateAttributes('gallery', { layout: 'scroll' })}
  />
  <SpecialToolbarButton
    aria-pressed={editor?.isActive('gallery', { layout: 'slide-1' }) ||
      editor?.isActive('gallery', { layout: 'slide-2' })}
    icon={IconContentSlide}
    label="슬라이드"
    on:click={() => editor?.commands.updateAttributes('gallery', { layout: 'slide-1' })}
  />
  <SpecialToolbarButton
    aria-pressed={editor?.isActive('gallery', { layout: 'grid-2' }) ||
      editor?.isActive('gallery', { layout: 'grid-3' })}
    icon={IconGrid}
    label="그리드"
    on:click={() => editor?.commands.updateAttributes('gallery', { layout: 'grid-2' })}
  />
</div>

{#if editor?.isActive('gallery', { layout: 'slide-1' }) || editor?.isActive('gallery', { layout: 'slide-2' })}
  <hr class={css({ border: 'none', width: '1px', height: '12px', backgroundColor: '[#DAD7E2]' })} />

  <div class={flex({ align: 'center', gap: '6px' })}>
    <SpecialToolbarButton
      aria-pressed={editor?.isActive('gallery', { layout: 'slide-1' })}
      icon={IconBookSinglePage}
      label="한쪽보기"
      variant="outline"
      on:click={() => editor?.commands.updateAttributes('gallery', { layout: 'slide-1' })}
    />
    <SpecialToolbarButton
      aria-pressed={editor?.isActive('gallery', { layout: 'slide-2' })}
      icon={IconBookBothPage}
      label="두쪽보기"
      variant="outline"
      on:click={() => editor?.commands.updateAttributes('gallery', { layout: 'slide-2' })}
    />
  </div>
{:else if editor?.isActive('gallery', { layout: 'grid-2' }) || editor?.isActive('gallery', { layout: 'grid-3' })}
  <hr class={css({ border: 'none', width: '1px', height: '12px', backgroundColor: '[#DAD7E2]' })} />

  <div class={flex({ align: 'center', gap: '6px' })}>
    <SpecialToolbarButton
      aria-pressed={editor?.isActive('gallery', { layout: 'grid-2' })}
      icon={IconGrid2Columns}
      label="2열"
      variant="outline"
      on:click={() => editor?.commands.updateAttributes('gallery', { layout: 'grid-2' })}
    />
    <SpecialToolbarButton
      aria-pressed={editor?.isActive('gallery', { layout: 'grid-3' })}
      icon={IconGrid3Columns}
      label="3열"
      variant="outline"
      on:click={() => editor?.commands.updateAttributes('gallery', { layout: 'grid-3' })}
    />
  </div>
{/if}
