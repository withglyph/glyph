<script lang="ts">
  import clsx from 'clsx';
  import { fade, fly } from 'svelte/transition';
  import IconX from '~icons/tabler/x';
  import { beforeNavigate } from '$app/navigation';
  import { Icon } from '$lib/components';
  import { portal } from '$lib/svelte/actions';

  export let open: boolean;

  beforeNavigate(() => {
    open = false;
  });
</script>

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
  <div class="fixed inset-0 z-50 sm:hidden" use:portal>
    <div
      class="absolute inset-0 bg-black/50 backdrop-blur"
      role="button"
      tabindex="-1"
      on:click={() => (open = false)}
      on:keypress={null}
      transition:fade={{ duration: 150 }}
    />

    <div class={clsx('pointer-events-none absolute flex justify-end top-0 bottom-0 right-0 w-75')}>
      <div
        class={clsx('pointer-events-auto max-h-full w-md flex flex-col bg-white shadow-xl px-2 py-2.5')}
        in:fly={{ x: '10%', duration: 150 }}
        out:fade={{ duration: 150 }}
      >
        <div class="overflow-x-hidden">
          <div class="flex items-center justify-end">
            <button class="m-3" type="button" on:click={() => (open = false)}>
              <Icon class="square-6" icon={IconX} />
            </button>
          </div>
          <slot />
        </div>
      </div>
    </div>
  </div>
{/if}
