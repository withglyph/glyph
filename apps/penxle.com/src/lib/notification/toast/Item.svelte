<script lang="ts">
  import { backInOut, expoInOut, linear, sineInOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';
  import { fly, scale, slide } from 'svelte/transition';
  import IconAlertTriangle from '~icons/tabler/alert-triangle';
  import IconCircleCheck from '~icons/tabler/circle-check';
  import IconX from '~icons/tabler/x';
  import { Icon } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import { store } from './store';
  import type { Toast } from './store';

  export let toast: Toast;

  const dismiss = () => store.update((v) => v.filter((t) => t.id !== toast.id));
  const progress = tweened(100, { duration: toast.duration, easing: linear });

  $: if ($progress === 0) {
    dismiss();
  }
</script>

<div
  class={flex({
    align: 'center',
    borderRadius: '8px',
    padding: '4px',
    width: 'fit',
    minWidth: '44px',
    maxWidth: 'full',
    height: '44px',
    backgroundColor: 'gray.800',
    dropShadow: '[0 10px 8px]', // drop-shadow-lg
    overflow: 'hidden',
    pointerEvents: 'auto',
    hideBelow: 'sm',
  })}
  in:scale={{ duration: 400, easing: backInOut }}
  out:scale={{ duration: 400, delay: 600, easing: backInOut }}
>
  <div
    class={css(
      {
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 'none',
        borderRadius: '4px',
        size: '36px',
        overflow: 'hidden',
      },
      toast.type === 'success' && { backgroundColor: '[#4ECEA6]' },
      toast.type === 'error' && { backgroundColor: '[#F66062]' },
    )}
  >
    <div
      style:transform={`translateX(${$progress}%)`}
      class={css({ position: 'absolute', inset: '0', backgroundColor: 'gray.900/15' })}
    />

    {#if toast.type === 'success'}
      <Icon style={css.raw({ color: 'gray.5' })} icon={IconCircleCheck} />
    {:else if toast.type === 'error'}
      <Icon style={css.raw({ color: 'gray.5' })} icon={IconAlertTriangle} />
    {/if}
  </div>

  <div
    in:slide={{ axis: 'x', duration: 400, delay: 400, easing: expoInOut }}
    out:slide={{ axis: 'x', duration: 400, delay: 200, easing: expoInOut }}
  >
    <div
      class={flex({ align: 'center', gap: '16px', paddingLeft: '16px', paddingRight: '8px', color: 'gray.5' })}
      on:introend={() => ($progress = 0)}
      in:fly={{ x: '-0.125rem', duration: 200, delay: 800, easing: sineInOut }}
      out:fly={{ x: '-0.125rem', duration: 200, easing: sineInOut }}
    >
      <div class={flex({ direction: 'column' })}>
        {#if toast.title}
          <span class={css({ fontSize: '12px', fontWeight: 'bold', lineClamp: 1 })}>{toast.title}</span>
        {/if}
        <span
          class={css(
            { lineClamp: 1 },
            toast.title ? { fontSize: '12px', fontWeight: 'semibold' } : { fontSize: '14px', fontWeight: 'bold' },
          )}
        >
          {toast.message}
        </span>
      </div>
      <button type="button" on:click={dismiss}>
        <Icon icon={IconX} />
      </button>
    </div>
  </div>
</div>

<div
  class={css({
    borderRadius: '8px',
    padding: '12px',
    width: 'fit',
    backgroundColor: 'gray.900/80',
    boxShadow: '[0 4px 4px 0 {colors.gray.900/10}]',
    hideFrom: 'sm',
  })}
  in:slide={{ axis: 'y', duration: 400, delay: 400, easing: expoInOut }}
  out:slide={{ axis: 'y', duration: 400, delay: 200, easing: expoInOut }}
>
  {#if toast.title}
    <span class={css({ fontSize: '13px', fontWeight: 'bold', color: 'gray.5', lineClamp: 1 })}>{toast.title}</span>
  {/if}
  <span class={css({ fontSize: '13px', fontWeight: 'medium', color: 'gray.5', lineClamp: 1 })}>{toast.message}</span>
</div>
