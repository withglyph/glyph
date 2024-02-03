<script lang="ts">
  import { flip, offset, shift } from '@floating-ui/dom';
  import clsx from 'clsx';
  import { setContext, tick } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { portal } from '$lib/svelte/actions';
  import { createFloatingActions } from '$lib/svelte-floating-ui';
  import type { Placement } from '@floating-ui/dom';

  export let open = false;
  let _class: string | undefined = undefined;
  let _offset: number | undefined = undefined;
  export let padding = true;

  export { _class as class };
  export { _offset as offset };

  export let as: 'button' | 'div' = 'button';

  export let placement: Placement = 'bottom-end';

  export let alignment: 'horizontal' | 'vertical' = 'vertical';

  export let preventClose = false;
  export let disabled = false;

  export let rounded = true;
  export let menuClass: string | undefined = undefined;

  $: props = as === 'button' ? { type: 'button', disabled } : { tabindex: -1 };

  setContext('close', preventClose ? undefined : () => (open = false));

  const [floatingRef, floatingContent, update] = createFloatingActions({
    strategy: 'absolute',
    placement,
    middleware: [offset(_offset ?? 4), flip(), shift({ padding: 8 })],
  });

  $: if (open) {
    // eslint-disable-next-line unicorn/prefer-top-level-await
    void tick().then(() => update());
  }

  afterNavigate(() => {
    open = false;
  });

  function toggleOpen() {
    open = !open;
  }
</script>

<!-- eslint-disable-next-line svelte/valid-compile -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<svelte:element
  this={as}
  class={_class}
  on:click={toggleOpen}
  on:keypress={as === 'div' ? toggleOpen : null}
  use:floatingRef
  {...props}
>
  <slot name="value" {open} />
</svelte:element>

{#if open}
  <div
    class="fixed inset-0 z-51"
    role="button"
    tabindex="-1"
    on:click={() => (open = false)}
    on:keypress={null}
    use:portal
  />

  <div
    class={clsx(
      'z-52 bg-cardprimary rounded-lg px-2.5 space-y-1 shadow-[0px_5px_22px_0px_rgba(0,0,0,0.06)] flex border border-gray-200',
      {
        'flex-col py-2.5': alignment === 'vertical',
        'flex-row py-1': alignment === 'horizontal',
      },
      !padding && 'p-none!',
      !rounded && 'rounded-t-none!',
      menuClass,
    )}
    use:floatingContent
    use:portal
  >
    <slot />
  </div>
{/if}
