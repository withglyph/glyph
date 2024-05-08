<script lang="ts">
  import IconChevronLeft from '~icons/tabler/chevron-left';
  import IconChevronRight from '~icons/tabler/chevron-right';
  import { Icon } from '$lib/components';
  import { css } from '$styled-system/css';
  import { center } from '$styled-system/patterns';

  export let listEl: HTMLElement | null = null;

  let containerEl: HTMLElement | null = null;
  let currentScroll = 0;

  const scrollLeft = (offset: number) => {
    if (!containerEl) return;

    containerEl.scrollLeft = containerEl.scrollLeft - (containerEl.offsetWidth - offset);
  };

  const scrollRight = (offset: number) => {
    if (!containerEl) return;

    containerEl.scrollLeft = containerEl.scrollLeft + (containerEl.offsetWidth - offset);
  };
</script>

<div class={css({ display: 'flex', alignItems: 'center', width: 'full', height: '116px' })}>
  <button
    class={center({
      marginLeft: '20px',
      marginRight: 'auto',
      paddingRight: '16px',
      width: '16px',
      height: '89px',
      color: { base: 'gray.500', _disabled: 'gray.300' },
    })}
    disabled={currentScroll <= 0}
    type="button"
    on:click={() => scrollLeft(50)}
  >
    <Icon icon={IconChevronLeft} size={16} />
  </button>

  <div
    bind:this={containerEl}
    class={css({
      width: 'full',
      height: '89px',
      overflowY: 'hidden',
      overflowX: 'auto',
      scrollbar: 'hidden',
      scrollBehavior: 'smooth',
    })}
    on:scroll={(e) => (currentScroll = e.currentTarget.scrollLeft)}
  >
    <ul
      bind:this={listEl}
      class={css({
        display: 'flex',
        alignItems: 'center',
        flexGrow: '1',
        gap: '8px',
      })}
    >
      <slot />
    </ul>
  </div>

  <button
    class={center({
      marginLeft: 'auto',
      marginRight: '20px',
      paddingLeft: '16px',
      width: '16px',
      height: '89px',
      color: { base: 'gray.500', _disabled: 'gray.300' },
    })}
    disabled={containerEl && containerEl.scrollWidth - currentScroll - containerEl.offsetWidth <= 0}
    type="button"
    on:click={() => scrollRight(50)}
  >
    <Icon icon={IconChevronRight} size={16} />
  </button>
</div>
