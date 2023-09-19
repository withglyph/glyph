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
        size === 'md' && 'w-full justify-center items-end sm:(p-6 center)',
        size === 'lg' && 'w-full justify-center items-end sm:(p-9 center)',
      )}
    >
      <div
        class={clsx(
          'pointer-events-auto relative max-h-full w-full flex flex-col center rounded-2xl bg-white shadow-xl',
          size === 'sm' && 'p-4 pt-8 max-w-92',
          size === 'md' &&
            'p-6 pb-5.5 rounded-b-none sm:(max-w-107.5 rounded-2xl)',
          size === 'lg' && 'p-7 pt-5 rounded-b-none sm:(max-w-187 rounded-2xl)',
        )}
        in:fly={{ y: '10%', duration: 150 }}
        out:fade={{ duration: 150 }}
      >
        <div class={clsx('flex flex-col w-full', size === 'sm' && 'max-w-92')}>
          {#if $$slots.title}
            <div
              class={clsx(
                'flex justify-between mb-6',
                size === 'sm' && 'justify-center!',
              )}
            >
              <div
                class={clsx(
                  'flex flex-col break-all',
                  size !== 'sm' && 'pr-9 mt-4',
                )}
              >
                <h3
                  class={clsx(
                    'text-lg font-bold break-keep',
                    size === 'md' && 'text-xl',
                  )}
                >
                  <slot name="title" />
                </h3>
                {#if $$slots.subtitle}
                  <div
                    class={clsx(
                      'flex justify-between mt-2 text-gray-50',
                      size === 'sm' && 'justify-center!',
                    )}
                  >
                    <h3 class="text-3.75 font-bold">
                      <slot name="subtitle" />
                    </h3>
                  </div>
                {/if}
              </div>
              {#if size !== 'sm'}
                <button
                  class="square-7 absolute right-6 flex center rounded text-gray-50 transition hover:(bg-gray-10 text-gray-60)"
                  type="button"
                  on:click={() => (open = false)}
                >
                  <span class="i-lc-x square-6" />
                </button>
              {/if}
            </div>
          {:else}
            <button
              class="absolute right-4 top-4 z-1 square-7 flex center rounded text-gray-50 transition hover:(bg-gray-10 text-gray-60)"
              type="button"
              on:click={() => (open = false)}
            >
              <span class="i-lc-x square-5" />
            </button>
          {/if}

          <div class="overflow-x-hidden">
            <slot />
          </div>

          {#if $$slots.action}
            <div
              class={clsx('flex items-center mt-4xl', size === 'md' && 'mt-4!')}
            >
              <slot name="action" />
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
