<script lang="ts">
  import clsx from 'clsx';
  import { fade, fly } from 'svelte/transition';
  import { beforeNavigate } from '$app/navigation';
  import { portal } from '$lib/svelte/actions';

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
  <div class="fixed inset-0 z-50 sm:hidden" use:portal>
    <div
      class="absolute inset-0 bg-black/50 backdrop-blur"
      role="button"
      tabindex="-1"
      on:click={() => (open = false)}
      on:keypress={null}
      transition:fade={{ duration: 150 }}
    />

    <div class={clsx('pointer-events-none absolute inset-0 flex items-end')}>
      <div
        class={clsx(
          'pointer-events-auto relative w-full h-fit flex flex-col center rounded-3xl bg-cardprimary shadow-xl rounded-b-none px-6 pb-6',
        )}
        in:fly={{ y: '20%', duration: 150 }}
        out:fade={{ duration: 150 }}
      >
        <div class="flex flex-col center w-full">
          <div class="w-9 h-1.5 my-2 bg-surface-primary rounded-xl" />
          <div class="overflow-x-hidden w-full">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
