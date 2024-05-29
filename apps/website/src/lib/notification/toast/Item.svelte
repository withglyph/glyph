<script lang="ts">
  import { expoInOut, linear } from 'svelte/easing';
  import { tweened } from 'svelte/motion';
  import { fade } from 'svelte/transition';
  import IconCircleCheckFilled from '~icons/tabler/circle-check-filled';
  import IconCircleXFilled from '~icons/tabler/circle-x-filled';
  import { Icon } from '$lib/components';
  import { css } from '$styled-system/css';
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
  class={css(
    {
      display: 'flex',
      alignItems: 'center',
      borderWidth: '1px',
      borderColor: 'gray.150',
      paddingX: '16px',
      paddingY: '12px',
      width: 'fit',
      minWidth: '44px',
      maxWidth: { base: '311px', sm: '420px' },
      minHeight: '46px',
      backgroundColor: 'gray.0',
      boxShadow: '[1px 1px 10px 0 {colors.gray.900/8}]',
      overflow: 'hidden',
      pointerEvents: 'auto',
    },
    toast.type === 'error' && {
      borderColor: 'red.600',
      backgroundColor: 'red.50',
    },
  )}
  on:introend={() => ($progress = 0)}
  in:fade={{ duration: 400, delay: 300, easing: expoInOut }}
  out:fade={{ duration: 400, delay: 200, easing: expoInOut }}
>
  <div
    class={css({
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flex: 'none',
      overflow: 'hidden',
    })}
  >
    {#if toast.type === 'success'}
      <Icon style={css.raw({ color: 'green.800' })} icon={IconCircleCheckFilled} />
    {:else}
      <Icon style={css.raw({ color: 'red.600' })} icon={IconCircleXFilled} />
    {/if}
  </div>

  <div>
    <div
      class={css(
        { display: 'flex', alignItems: 'center', paddingLeft: '6px' },
        toast.type === 'error' && { color: 'red.600' },
      )}
    >
      <span class={css({ fontSize: '13px', wordBreak: 'break-all' })}>
        {toast.message}
      </span>
    </div>
  </div>
</div>
