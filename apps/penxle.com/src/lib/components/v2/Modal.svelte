<script lang="ts">
  import clsx from 'clsx';
  import { fade, fly } from 'svelte/transition';
  import { portal, scrollLock } from '$lib/svelte/actions';

  export let open: boolean;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  let _class: string | undefined = undefined;
  export let titleClass: string | undefined = undefined;
  export { _class as class };
</script>

<svelte:window on:keydown={(e) => e.key === 'Escape' && (open = false)} />

{#if open}
  <div class="fixed inset-0 z-100" use:portal>
    <div
      class="absolute inset-0 bg-black/40"
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
          'pointer-events-auto w-178 select-text rounded-2.5 bg-white shadow-[0px_8px_24px_0px_rgba(0,0,0,0.28)]',
          size === 'sm' && 'max-w-92',
          size === 'md' && 'rounded-b-none sm:(max-w-107.5 rounded-2xl)',
          size === 'lg' && 'rounded-b-none sm:(max-w-187 rounded-2xl)',
        )}
        use:scrollLock
        in:fly={{ y: 10 }}
        out:fade={{ duration: 150 }}
      >
        <header class="relative flex items-center px-6 py-3.5 border-b border-gray-200">
          <slot name="title-left" />

          <h3 class={clsx('break-keep text-16-sb flex flex-1 m-r-8', titleClass)}>
            <slot name="title" />
          </h3>

          <slot name="title-right">
            <button class="absolute right-0 px-6" type="button" on:click={() => (open = false)}>
              <i class="i-tb-x square-6" />
            </button>
          </slot>
        </header>

        <div
          class={clsx('relative content flex flex-col w-full overflow-y-auto <sm:h-160 rounded-b-inherit', _class)}
          data-scroll-lock-ignore
        >
          <slot />

          {#if $$slots.action}
            <div
              class="sticky w-full bottom-0 border-t border-gray-200 flex items-center justify-end px-6 py-4 bg-white rounded-b-inherit"
            >
              <slot name="action" />
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
