<script lang="ts">
  import { clsx } from 'clsx';
  import IconAlertTriangleFilled from '~icons/tabler/alert-triangle-filled';
  import IconChecked from '~icons/tabler/check';
  import { Icon } from '$lib/components';
  import { getFormContext } from '$lib/form';
  import FormValidationMessage from './FormValidationMessage.svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';

  export let name: string | null | undefined = undefined;
  export let checked: boolean | null | undefined = false;
  let _class: string | null | undefined = undefined;
  export { _class as class };

  type $$Props = HTMLInputAttributes;
  type $$Events = {
    change: Parameters<NonNullable<HTMLInputAttributes['on:change']>>[0];
  };

  const { field } = getFormContext();

  if (field) {
    name = field.name;
  }
</script>

<div>
  <label class={clsx('flex relative items-center gap-1.5 select-none', _class)}>
    <input
      id={name}
      {name}
      class="flex center square-4.5 shrink-0 border border-gray-300 rounded-0.75 cursor-pointer appearance-none transition checked:(border-none bg-teal-500) enabled:(aria-[invalid]:border-red-50 hover:border-gray-300!)"
      type="checkbox"
      on:change
      bind:checked
      {...$$restProps}
    />
    {#if checked}
      <div class="absolute top-1px left-0 square-4.5 flex center">
        <Icon class="text-white square-3.5 block" icon={IconChecked} />
      </div>
    {/if}

    <span class="slot cursor-pointer">
      <slot />
    </span>
  </label>
  {#if name}
    <FormValidationMessage for={name} let:message>
      <div class="flex items-center gap-1.5 mt-1.5 text-11-r text-gray-400">
        <Icon class="text-error-900" icon={IconAlertTriangleFilled} />
        {message}
      </div>
    </FormValidationMessage>
  {/if}
</div>
