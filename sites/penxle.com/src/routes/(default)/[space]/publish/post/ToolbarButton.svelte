<script lang="ts">
  import { clsx } from 'clsx';
  import { Tooltip } from '$lib/components';

  let _class: string;
  export { _class as class };
  export let name: string;
  export let active = false;
  export let enabled = true;
</script>

<Tooltip message={name} placement="top">
  <button
    class="square-10 flex center rounded enabled:hover:bg-gray-10"
    disabled={!enabled}
    type="button"
    on:click
  >
    <span
      class={clsx(
        'square-6!',
        _class,
        active && 'text-brand-50!',
        !enabled && 'opacity-10',
      )}
    />
  </button>
</Tooltip>
