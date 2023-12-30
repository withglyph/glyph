<script lang="ts">
  import clsx from 'clsx';
  import type { ChangeEventHandler } from 'svelte/elements';

  export let label: string;
  export let options: readonly string[] = [];

  let _class: string | undefined = undefined;
  export { _class as class };

  export let value: string | undefined = undefined;

  const onPickerItemChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (event.currentTarget.checked) {
      value = event.currentTarget.value;
    }
  };
</script>

<fieldset class={clsx(_class)}>
  <legend class="body-16-m text-secondary">{label}</legend>
  <div class="flex gap-2 mt-xs flex-wrap">
    {#each options as color (color)}
      <input
        name={label}
        class={clsx(
          'appearance-none square-2.875rem border-(width-0.0625rem border-secondary) background-gradient rounded-50% checked:(shadow-([0_0_0_0.15rem_#D6D3D1]))',
          color,
        )}
        checked={color === value}
        type="radio"
        value={color}
        on:change={onPickerItemChange}
      />
    {/each}
  </div>
</fieldset>

<style>
  .background-gradient {
    --border-width: 0.025rem;
    --border-color: rgba(190, 190, 190, 30%);
    --box-size: 18%;
    background-image: linear-gradient(var(--border-color) var(--border-width), transparent var(--border-width)),
      linear-gradient(to right, var(--border-color) var(--border-width), transparent var(--border-width));
    background-size: var(--box-size) var(--box-size);
  }
</style>
