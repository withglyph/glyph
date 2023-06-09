<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { portal } from '$lib/svelte/actions';

  export let open: boolean;
</script>

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

    <div class="pointer-events-none absolute inset-0 flex center p-8">
      <div
        class="pointer-events-auto max-h-full max-w-md w-full flex flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        in:fly={{ y: '10%', duration: 150 }}
        out:fade={{ duration: 150 }}
      >
        <div class="flex justify-between border-b p-6">
          <h3 class="text-xl font-semibold">
            <slot name="title" />
          </h3>
          <button
            class="square-7 flex center rounded text-gray-500 transition hover:(bg-gray-100 text-gray-600)"
            type="button"
            on:click={() => (open = false)}
          >
            <span class="i-lc-x square-5" />
          </button>
        </div>

        <div class="overflow-x-hidden overflow-y-scroll p-6">
          <slot />
        </div>

        <!-- eslint-disable @typescript-eslint/no-unsafe-member-access -->
        {#if $$slots.action}
          <div class="flex items-center justify-end border-t px-6 py-4">
            <slot name="action" />
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
