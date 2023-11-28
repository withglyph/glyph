<script lang="ts">
  import { computePosition, flip, offset, shift } from '@floating-ui/dom';
  import clsx from 'clsx';
  import { setContext, tick } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { portal } from '$lib/svelte/actions';
  import type { Placement } from '@floating-ui/dom';

  let open = false;
  let targetEl: HTMLButtonElement;
  let menuEl: HTMLDivElement;
  let _class: string | undefined = undefined;
  let _offset: number | undefined = undefined;

  export { _class as class };
  export { _offset as offset };
  export let placement: Placement = 'bottom-end';

  export let alignment: 'horizontal' | 'vertical' = 'vertical';

  export let preventClose = false;
  export let disabled = false;

  setContext('close', preventClose ? undefined : () => (open = false));

  const update = async () => {
    await tick();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const position = await computePosition(targetEl.firstElementChild!, menuEl, {
      placement,
      middleware: [offset(_offset ?? 4), flip(), shift({ padding: 8 })],
    });

    Object.assign(menuEl.style, {
      left: `${position.x}px`,
      top: `${position.y}px`,
    });
  };

  $: if (open) {
    void update();
  }

  afterNavigate(() => {
    open = false;
  });
</script>

<button bind:this={targetEl} class={clsx('contents', _class)} {disabled} type="button" on:click={() => (open = !open)}>
  <slot name="value" />
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

  <div
    bind:this={menuEl}
    class={clsx('absolute z-52 bg-cardprimary rounded-lg px-1 space-y-1 shadow-[0_4px_16px_0_rgba(0,0,0,0.15)] flex', {
      'flex-col py-2': alignment === 'vertical',
      'flex-row py-1': alignment === 'horizontal',
    })}
    use:portal
  >
    <slot />
  </div>
{/if}
