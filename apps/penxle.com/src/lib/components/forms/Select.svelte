<script lang="ts">
  import { flip, offset, shift } from '@floating-ui/dom';
  import { writable } from '@svelte-kits/store';
  import clsx from 'clsx';
  import { setContext, tick } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { portal } from '$lib/svelte/actions';
  import { createFloatingActions } from '$lib/svelte-floating-ui';
  import type { Placement } from '@floating-ui/dom';

  let open = false;
  let _class: string | undefined = undefined;

  export { _class as class };
  export let name: string | undefined = undefined;
  export let defaultValue = '';
  export let defaultText = '';
  export let placement: Placement = 'bottom-end';

  let value = writable(defaultValue);
  let text = writable(defaultText);

  setContext('currentValue', value);
  setContext('currentText', text);
  setContext('close', () => (open = false));

  const [floatingRef, floatingContent, update] = createFloatingActions({
    strategy: 'absolute',
    placement,
    middleware: [offset(4), flip(), shift({ padding: 8 })],
  });

  $: if (open) {
    // eslint-disable-next-line unicorn/prefer-top-level-await
    void tick().then(() => update());
  }

  afterNavigate(() => {
    open = false;
  });
</script>

<input id={name} {name} type="hidden" bind:value={$value} />

<button
  class={clsx('w-fit', _class)}
  role="listbox"
  tabindex={0}
  type="button"
  on:click={() => (open = true)}
  use:floatingRef
>
  {$text}
</button>

{#if open}
  <div
    class="fixed inset-0 z-51"
    role="button"
    tabindex="-1"
    on:click={() => (open = false)}
    on:keypress={null}
    use:portal
  />

  <ul
    class="z-52 bg-cardprimary rounded-lg py-2 px-1 space-y-1 shadow-[0_4px_16px_0_rgba(0,0,0,0.15)]"
    use:floatingContent
    use:portal
  >
    <slot />
  </ul>
{/if}
