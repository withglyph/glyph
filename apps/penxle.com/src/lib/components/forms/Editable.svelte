<script lang="ts">
  import clsx from 'clsx';
  import IconEdit from '~icons/tabler/edit';
  import { Icon } from '$lib/components';
  import type { HTMLInputAttributes } from 'svelte/elements';

  export let value: string | null | undefined = undefined;

  type $$Props = HTMLInputAttributes & { value?: typeof value };
  type $$Events = {
    input: Parameters<NonNullable<HTMLInputAttributes['on:input']>>[0];
    blur: Parameters<NonNullable<HTMLInputAttributes['on:blur']>>[0];
  };

  let editing = false;
  let inputEl: HTMLInputElement;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<label
  class="relative flex items-center gap-1"
  on:click={() => {
    editing = true;
  }}
>
  <span class={clsx(editing && 'invisible', !value && 'text-disabled')} role="textbox" tabindex="-1">
    {value || $$props.placeholder}
  </span>
  <input
    {...$$props}
    bind:this={inputEl}
    class={clsx(!editing && 'hidden', 'w-full absolute left-0', $$props.class)}
    tabindex="0"
    type="text"
    on:blur={() => {
      editing = false;
    }}
    bind:value
    on:blur
  />
  <button
    class={clsx('text-secondary disabled:text-disabled', editing && 'hidden')}
    type="button"
    on:click={() => {
      editing = true;

      setTimeout(() => {
        inputEl.select();
      });
    }}
  >
    <Icon class="square-6" icon={IconEdit} />
  </button>
</label>
