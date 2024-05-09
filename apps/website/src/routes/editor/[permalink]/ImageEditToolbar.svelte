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
  import IconArrowsExchange from '~icons/tabler/arrows-exchange';
  import IconEdit from '~icons/tabler/edit';
  import { Icon } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import ImageToolbarButton from './ImageToolbarButton.svelte';
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
  <!-- TODO: single image-->
  {#if true}
    <Icon icon={IconArrowsExchange} size={20} />
    이미지교체
  {:else}
    <Icon icon={IconEdit} size={20} />
    그룹편집
  {/if}
</button>

<hr class={css({ border: 'none', width: '1px', height: '12px', backgroundColor: '[#DAD7E2]' })} />

<div class={flex({ align: 'center', gap: '6px' })}>
  <ImageToolbarButton aria-pressed="true" icon={IconEmbedFull} />
  <ImageToolbarButton icon={IconEmbedCompact} />
</div>

<!-- TODO: compact size-->
{#if true}
  <hr class={css({ border: 'none', width: '1px', height: '12px', backgroundColor: '[#DAD7E2]' })} />

  <div class={flex({ align: 'center', gap: '6px' })}>
    <ImageToolbarButton aria-pressed="true" icon={IconAlignLeft} />
    <ImageToolbarButton icon={IconAlignCenter} />
    <ImageToolbarButton icon={IconAlignRight} />
  </div>
{/if}

<hr class={css({ border: 'none', width: '1px', height: '12px', backgroundColor: '[#DAD7E2]' })} />

<div class={flex({ align: 'center', gap: '6px' })}>
  <ImageToolbarButton aria-pressed="true" icon={IconContentScroll} label="스크롤" />
  <ImageToolbarButton icon={IconContentSlide} label="슬라이드" />
  <ImageToolbarButton icon={IconGrid} label="그리드" />
</div>

<!-- TODO: slide -->
{#if false}
  <hr class={css({ border: 'none', width: '1px', height: '12px', backgroundColor: '[#DAD7E2]' })} />

  <div class={flex({ align: 'center', gap: '6px' })}>
    <ImageToolbarButton aria-pressed="true" icon={IconBookSinglePage} label="한쪽보기" variant="outline" />
    <ImageToolbarButton icon={IconBookBothPage} label="두쪽보기" variant="outline" />
  </div>
  <!-- TODO: grid -->
{:else if true}
  <hr class={css({ border: 'none', width: '1px', height: '12px', backgroundColor: '[#DAD7E2]' })} />

  <div class={flex({ align: 'center', gap: '6px' })}>
    <ImageToolbarButton aria-pressed="true" icon={IconGrid2Columns} label="2열" variant="outline" />
    <ImageToolbarButton icon={IconGrid3Columns} label="3열" variant="outline" />
  </div>
{/if}
