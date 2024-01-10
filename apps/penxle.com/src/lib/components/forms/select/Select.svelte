<script generics="T extends string" lang="ts">
  import { flip, offset, shift } from '@floating-ui/dom';
  import clsx from 'clsx';
  import { createListbox } from 'svelte-headlessui';
  import { Transition } from '$lib/components';
  import { createFloatingActions } from '$lib/svelte-floating-ui';
  import { SelectDivider } from '.';
  import type { Placement } from '@floating-ui/dom';

  type $$Props = Parameters<typeof createListbox>[0] & {
    class?: string;
    name?: string;
    placement?: Placement;
    disabled?: boolean;
    options: { value: T; label?: string; divider?: boolean }[];
    initialValue?: string;
    onSelected?: (value: T) => void;
  };

  let _class: string | undefined = undefined;
  export { _class as class };

  let initialized = false;

  export let disabled: $$Props['disabled'] = undefined;
  export let name: $$Props['name'] = undefined;
  export let options: $$Props['options'];
  export let initialValue: $$Props['initialValue'] = undefined;

  const listbox = createListbox({ ...$$restProps, label: name, selected: initialValue });

  const valueToLocalString = (value: string) => options.find((option) => option.value === value)?.label ?? value;

  export let onSelected: ((value: string) => void) | undefined = undefined;
  const _onSelected = (e: Event) => {
    if (initialized === false) {
      initialized = true;
      return;
    }

    if (!(e instanceof CustomEvent)) throw new Error('Invalid event type');

    if (onSelected) {
      onSelected(e.detail.selected);
    }
  };

  export let placement: Placement = 'bottom-end';

  const [floatingRef, floatingContent, update] = createFloatingActions({
    strategy: 'absolute',
    placement,
    middleware: [offset(4), flip(), shift({ padding: 8 })],
  });

  $: if ($listbox.expanded) {
    void update();
  }
</script>

<button {disabled} type="button" on:select={_onSelected} use:floatingRef use:listbox.button>
  <slot name="button">
    <div
      class={clsx(
        'flex items-center body-14-m p-x-4 p-x-2 gap-0.625rem border-(0.0625rem border-primary) rounded-3 text-primary hover:border-tertiary disabled:(border-secondary text-disabled)',
        _class,
      )}
    >
      <span class="block truncate">{valueToLocalString($listbox.selected)}</span>
      <i class="i-lc-chevron-down square-6 color-icon-secondary" />
      <input {name} type="hidden" bind:value={$listbox.selected} />
    </div>
  </slot>
</button>

<Transition
  leave="transition ease-in duration-100"
  leaveFrom="opacity-100"
  leaveTo="opacity-0"
  show={$listbox.expanded}
>
  <div
    class="z-52 bg-cardprimary rounded-lg py-2 px-1 space-y-1 shadow-[0_4px_16px_0_rgba(0,0,0,0.10)] focus:outline-none"
    role="listbox"
    use:floatingContent
    use:listbox.items
    {...$$restProps}
  >
    {#each options as { value, label, divider } (value)}
      {@const active = $listbox.active === value}
      {#if divider}
        <SelectDivider />
      {/if}
      <div
        class={clsx(
          'body-14-sb text-secondary px-4 py-3 w-full rounded-lg focus:bg-primary aria-selected:text-primary',
          active && 'bg-primary',
        )}
        use:listbox.item={{ value }}
        {...$$restProps}
      >
        {label ?? value}
      </div>
    {/each}
  </div>
</Transition>
