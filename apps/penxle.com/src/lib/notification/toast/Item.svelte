<script lang="ts">
  import { writable } from '@svelte-kits/store';
  import { clsx } from 'clsx';
  import { onMount } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';
  import { fade } from 'svelte/transition';
  import { hover } from '$lib/svelte/actions';
  import type { Toast } from './store';

  export let toast: Toast;

  let el: HTMLDivElement;
  const hovered = writable(false);

  const top = tweened<number | null>(null, { easing: cubicOut });
  $: if (toast.mounted) {
    $top = toast.top;
  }

  onMount(() => {
    toast.set({
      mounted: true,
      top: el.offsetTop,
      height: el.offsetHeight,
    });

    let startedTime: number;
    let lastTickTime: number;
    let duration = toast.duration;

    const tick = (time: number) => {
      if (!startedTime && !lastTickTime) {
        startedTime = time;
        lastTickTime = time;
      }

      if ($hovered) {
        duration += time - lastTickTime;
      }

      const elapsed = time - startedTime;
      if (elapsed > duration) {
        toast.dismiss();
        return;
      }

      lastTickTime = time;
      id = requestAnimationFrame(tick);
    };

    let id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  });
</script>

<div
  bind:this={el}
  style:position={toast.mounted ? 'absolute' : 'relative'}
  style:top={`${$top ?? 0}px`}
  style:right="0px"
  class={clsx(
    'max-w-100 min-w-100 border rounded px-4 py-3',
    toast.type === 'info' && 'border-brand-30 bg-brand-5',
    toast.type === 'success' && 'border-green-50 bg-green-5',
    toast.type === 'error' && 'border-red-50 bg-red-5',
  )}
  use:hover={hovered}
  transition:fade={{ duration: 200 }}
>
  <div class="w-full flex items-center gap-4">
    <span
      class={clsx(
        'square-5',
        toast.type === 'info' && 'i-lc-info text-brand-50',
        toast.type === 'success' && 'i-lc-check-circle text-green-50',
        toast.type === 'error' && 'i-lc-alert-circle text-red-50',
      )}
    />
    <div
      class={clsx(
        'grow break-all font-semibold',
        toast.type === 'info' && 'text-brand-70',
        toast.type === 'success' && 'text-green-90',
        toast.type === 'error' && 'text-red-70',
      )}
    >
      {#if toast.title}
        {toast.title}
      {:else}
        {toast.message}
      {/if}
    </div>
    <button
      class={clsx(
        'i-lc-x square-5',
        toast.type === 'info' && 'text-brand-50',
        toast.type === 'success' && 'text-green-50',
        toast.type === 'error' && 'text-red-50',
      )}
      type="button"
      on:click={toast.dismiss}
    />
  </div>
  {#if toast.title}
    <div
      class={clsx(
        'break-all px-9 mt-1',
        toast.type === 'info' && 'text-brand-50',
        toast.type === 'success' && 'text-green-90',
        toast.type === 'error' && 'text-red-70',
      )}
    >
      {toast.message}
    </div>
  {/if}
</div>
