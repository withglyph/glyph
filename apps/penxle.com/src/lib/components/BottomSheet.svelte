<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { beforeNavigate } from '$app/navigation';
  import { portal } from '$lib/svelte/actions';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';

  export let open: boolean;

  beforeNavigate(() => {
    open = false;
  });
</script>

<svelte:window on:keydown={(e) => e.key === 'Escape' && (open = false)} />
<svelte:head>
  {#if open}
    <style>
      body {
        overflow: hidden;
        user-select: none;
      }
    </style>
  {/if}
</svelte:head>

{#if open}
  <div class={css({ position: 'fixed', inset: '0', zIndex: '50', hideFrom: 'sm' })} use:portal>
    <div
      class={css({
        position: 'absolute',
        inset: '0',
        backgroundColor: '[black/50]',
        backdropFilter: 'auto',
        backdropBlur: '8px',
      })}
      role="button"
      tabindex="-1"
      on:click={() => (open = false)}
      on:keypress={null}
      transition:fade={{ duration: 150 }}
    />

    <div class={flex({ position: 'absolute', inset: '0', align: 'flex-end', pointerEvents: 'none' })}>
      <div
        class={center({
          position: 'relative',
          flexDirection: 'column',
          borderRadius: '[24px]',
          borderBottomRadius: '0',
          paddingX: '24px',
          paddingY: '24px',
          width: 'full',
          height: 'fit',
          backgroundColor: 'white',
          pointerEvents: 'auto',
        })}
        in:fly={{ y: '20%', duration: 150 }}
        out:fade={{ duration: 150 }}
      >
        <div class={center({ flexDirection: 'column', width: 'full' })}>
          <div
            class={css({
              borderRadius: '12px',
              marginY: '8px',
              width: '36px',
              height: '6px',
              backgroundColor: 'gray.100',
            })}
          />
          <div class={css({ width: 'full', overflowX: 'hidden' })}>
            <slot />
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
