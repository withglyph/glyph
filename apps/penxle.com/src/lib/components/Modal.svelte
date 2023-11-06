<script lang="ts">
  import clsx from 'clsx';
  import { fade, fly } from 'svelte/transition';
  import { beforeNavigate } from '$app/navigation';
  import { portal } from '$lib/svelte/actions';

  export let open: boolean;
  export let size: 'sm' | 'md' | 'lg' = 'md';

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
  <div class="fixed inset-0 z-50" use:portal>
    <div
      class="absolute inset-0 bg-black/50 backdrop-blur"
      role="button"
      tabindex="-1"
      on:click={() => (open = false)}
      on:keypress={null}
      transition:fade={{ duration: 150 }}
    />

    <div
      class={clsx(
        'pointer-events-none absolute inset-0 flex',
        size === 'sm' && 'p-5 center',
        size === 'md' && 'w-full justify-center items-end sm:(p-6 center!)',
        size === 'lg' && 'w-full justify-center items-end sm:(p-9 center!)',
      )}
    >
      <div
        class={clsx(
          'pointer-events-auto relative max-h-full w-full flex flex-col center rounded-2xl bg-cardprimary shadow-xl',
          size === 'sm' && 'p-4 pt-8 max-w-92',
          size === 'md' && 'px-6 pt-4 pb-5.5 rounded-b-none sm:(max-w-107.5 rounded-2xl)',
          size === 'lg' && 'p-7 pt-5 rounded-b-none sm:(max-w-187 rounded-2xl)',
        )}
        in:fly={{ y: '10%', duration: 150 }}
        out:fade={{ duration: 150 }}
      >
        <div class={clsx('flex flex-col w-full', size === 'sm' && 'max-w-92')}>
          {#if $$slots.title}
            <div
              class={clsx(
                'flex justify-between py-3',
                size === 'sm' && 'justify-center! text-center',
                size !== 'sm' && 'pt-4 pb-0',
              )}
            >
              <div
                class={clsx(
                  'flex flex-col break-all',
                  size !== 'sm' && 'pr-9 mt-4 mb-4',
                  size !== 'sm' && 'text' in $$slots && 'mb-2!',
                )}
              >
                <h3 class={clsx('break-keep', size === 'sm' && 'subtitle-18-eb', size !== 'sm' && 'title-20-b')}>
                  <slot name="title" />
                </h3>
                {#if $$slots.subtitle}
                  <div
                    class={clsx(
                      'flex justify-between mt-1 text-secondary body-16-m',
                      size === 'sm' && 'justify-center! text-center',
                    )}
                  >
                    <h4>
                      <slot name="subtitle" />
                    </h4>
                  </div>
                {/if}
              </div>
              {#if size !== 'sm'}
                <button
                  class="absolute right-6 z-1 square-7 flex center rounded text-secondary transition hover:(bg-gray-10 text-gray-60)"
                  type="button"
                  on:click={() => (open = false)}
                >
                  <span class="i-lc-x square-6" />
                </button>
              {/if}
            </div>
          {:else}
            <button
              class="absolute right-6 z-1 square-7 flex center rounded text-secondary transition hover:(bg-gray-10 text-gray-60)"
              type="button"
              on:click={() => (open = false)}
            >
              <span class="i-lc-x square-6" />
            </button>
          {/if}

          <div class="overflow-x-hidden">
            <slot name="text" />
            <slot />
          </div>

          {#if $$slots.action}
            <div
              class={clsx(
                'flex items-center',
                size === 'sm' && 'mt-4',
                size === 'md' && 'mt-6',
                size === 'lg' && 'mt-4',
              )}
            >
              <slot name="action" />
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
