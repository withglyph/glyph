<script lang="ts">
  import clsx from 'clsx';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { store } from './store';
  import type { Toast } from './store';

  export let toast: Toast;

  const dismiss = () => store.update((v) => v.filter((t) => t.id !== toast.id));

  onMount(() => {
    const timeout = setTimeout(dismiss, 5000);
    return () => clearTimeout(timeout);
  });
</script>

<div
  class="--toast rounded-lg w-96 h-12 flex gap-4 items-center drop-shadow bg-white relative"
  out:fade={{ duration: 200 }}
>
  <div
    class={clsx(
      '--icon w-full h-full flex center absolute overflow-hidden',
      toast.type === 'success' && 'bg-green-50',
      toast.type === 'error' && 'bg-red-50',
    )}
  >
    <div class="--progress absolute square-14 top-0 -left-14 bg-black/10" />
    <span
      class={clsx(
        'text-white',
        toast.type === 'success' && 'i-lc-check-circle',
        toast.type === 'error' && 'i-lc-alert-triangle',
      )}
    />
  </div>

  <div class="flex flex-col gap-1 absolute left-18">
    <div
      class={clsx(
        '--title font-extrabold text-xs',
        toast.type === 'success' && 'text-green-50',
        toast.type === 'error' && 'text-red-50',
      )}
    >
      {toast.message}
    </div>

    <div class="--message text-gray-50 text-xs">
      {toast.message}
    </div>
  </div>
</div>

<style>
  .--toast {
    animation: toast 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0s both;
  }

  .--icon {
    animation: icon 0.5s cubic-bezier(0.5, 1, 0.89, 1) 0.45s both;
  }

  .--title {
    animation: title 0.3s cubic-bezier(0.5, 1, 0.89, 1) 1s both;
  }

  .--message {
    animation: message 0.3s cubic-bezier(0.5, 1, 0.89, 1) 1.25s both;
  }

  .--progress {
    animation: progress 3.4s linear 1.5s both;
  }

  @keyframes toast {
    0% {
      transform: translateX(calc(-100% - 2rem));
    }

    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes icon {
    0% {
      --uno: w-full rounded-lg;
    }

    100% {
      --uno: w-14 rounded-l-lg;
    }
  }

  @keyframes title {
    0% {
      opacity: 0;
      transform: translateX(20%);
    }

    100% {
      opacity: 1;
      transform: translate(0);
    }
  }

  @keyframes message {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }

  @keyframes progress {
    100% {
      left: 0;
    }
  }
</style>
