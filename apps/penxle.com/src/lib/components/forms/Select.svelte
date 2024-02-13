<script lang="ts">
  import clsx from 'clsx';
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { afterNavigate } from '$app/navigation';
  import { createFloatingActions, portal } from '$lib/svelte/actions';
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

  const { anchor, floating } = createFloatingActions({
    placement,
    offset: 4,
  });

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
  use:anchor
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

  <ul class="z-52 bg-cardprimary rounded-lg py-2 px-1 space-y-1 shadow-[0_4px_16px_0_rgba(0,0,0,0.15)]" use:floating>
    <slot />
  </ul>
{/if}
