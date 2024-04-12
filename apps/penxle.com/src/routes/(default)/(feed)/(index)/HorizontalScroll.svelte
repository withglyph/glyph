<script lang="ts">
  import { css } from '$styled-system/css';
  import { center } from '$styled-system/patterns';
  import type { SystemStyleObject } from '$styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;
  export let gradientStyle: SystemStyleObject | undefined = undefined;

  let containerEl: HTMLDivElement | null = null;
  let currentScroll = 0;

  const scrollLeft = (offset: number) => {
    if (!containerEl) return;

    containerEl.scrollLeft = containerEl.scrollLeft - (window.innerWidth - offset);
  };

  const scrollRight = (offset: number) => {
    if (!containerEl) return;

    containerEl.scrollLeft = containerEl.scrollLeft + (window.innerWidth - offset);
  };
</script>

<div class={css({ position: 'relative', smDown: { marginRight: '-20px' } })}>
  <div
    bind:this={containerEl}
    class={css(
      {
        display: 'flex',
        alignItems: 'center',
        overflowX: 'auto',
        scrollbar: 'hidden',
        scrollBehavior: 'smooth',
        sm: {
          _hover: {
            '& > div': { visibility: 'visible', opacity: '100', transition: 'opacity' },
          },
        },
      },
      style,
    )}
    on:scroll={(e) => (currentScroll = e.currentTarget.scrollLeft)}
  >
    {#if currentScroll > 0}
      <div
        class={css(
          {
            position: 'absolute',
            left: '0',
            bgGradient: 'to-l',
            zIndex: '1',
            visibility: 'hidden',
            opacity: '0',
          },
          gradientStyle,
        )}
      >
        <button
          class={center({
            borderRadius: 'full',
            marginRight: 'auto',
            size: '34px',
            backgroundColor: '[#000000/40]',
          })}
          type="button"
          on:click={() => scrollLeft(50)}
        >
          <slot name="left-icon" />
        </button>
      </div>
    {/if}

    <slot />

    {#if containerEl && containerEl.scrollWidth - currentScroll - containerEl.offsetWidth > 0}
      <div
        class={css(
          {
            position: 'absolute',
            right: '0',
            bgGradient: 'to-r',
            zIndex: '1',
            visibility: 'hidden',
            opacity: '0',
          },
          gradientStyle,
        )}
      >
        <button
          class={center({
            borderRadius: 'full',
            marginLeft: 'auto',
            size: '34px',
            backgroundColor: '[#000000/40]',
          })}
          type="button"
          on:click={() => scrollRight(50)}
        >
          <slot name="right-icon" />
        </button>
      </div>
    {/if}
  </div>
</div>
