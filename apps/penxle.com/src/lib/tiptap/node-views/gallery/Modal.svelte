<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { portal, scrollLock } from '$lib/svelte/actions';

  export let open = false;
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

    <div class="pointer-events-none absolute inset-0 flex center">
      <div
        class="pointer-events-auto relative w-178 h-160 select-text rounded-2.5 bg-white shadow-[0px_8px_24px_0px_rgba(0,0,0,0.28)]"
        use:scrollLock
        in:fly={{ y: 10 }}
      >
        {#if $$slots.title}
          <div class="flex justify-between items-center border-b border-gray-200">
            <h3 class="break-keep text-16-sb px-6 py-3.5 flex items-center">
              <slot name="title" />
            </h3>

            <button class="px-6" type="button" on:click={() => (open = false)}>
              <i class="i-tb-x square-6" />
            </button>
          </div>
        {/if}

        <slot />

        {#if $$slots.action}
          <div class="absolute w-full bottom-0 h-76px border-t border-gray-200 flex items-center justify-end px-6 py-4">
            <slot name="action" />
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
