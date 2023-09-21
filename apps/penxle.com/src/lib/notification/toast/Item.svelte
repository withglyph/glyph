<script lang="ts">
  import clsx from 'clsx';
  import { backInOut, expoInOut, linear, sineInOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';
  import { fly, scale, slide } from 'svelte/transition';
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
  class="flex items-center rounded-lg min-w-11 w-fit max-w-full h-11 p-1 bg-gray-80 drop-shadow-lg pointer-events-auto overflow-hidden"
  in:scale={{ duration: 400, easing: backInOut }}
  out:scale={{ duration: 400, delay: 600, easing: backInOut }}
>
  <div
    class={clsx(
      'square-9 flex flex-none center relative rounded overflow-hidden',
      toast.type === 'success' && 'bg-green-50',
      toast.type === 'error' && 'bg-red-50',
    )}
  >
    <div
      style:transform={`translateX(${$progress}%)`}
      class="absolute inset-0 bg-black/15"
    />

    <span
      class={clsx(
        'text-white',
        toast.type === 'success' && 'i-lc-check-circle-2',
        toast.type === 'error' && 'i-lc-alert-triangle',
      )}
    />
  </div>

  <div
    in:slide={{ axis: 'x', duration: 400, delay: 400, easing: expoInOut }}
    out:slide={{ axis: 'x', duration: 400, delay: 200, easing: expoInOut }}
  >
    <div
      class="flex items-center gap-4 text-white pl-4 pr-2"
      on:introend={() => ($progress = 0)}
      in:fly={{ x: '-0.125rem', duration: 200, delay: 800, easing: sineInOut }}
      out:fly={{ x: '-0.125rem', duration: 200, easing: sineInOut }}
    >
      <div class="flex flex-col">
        {#if toast.title}
          <span class="text-xs font-bold line-clamp-1">{toast.title}</span>
        {/if}
        <span
          class={clsx(
            'line-clamp-1',
            toast.title ? 'text-xs font-semibold' : 'text-sm font-bold',
          )}
        >
          {toast.message}
        </span>
      </div>
      <button class="i-lc-x" type="button" on:click={dismiss} />
    </div>
  </div>
</div>
