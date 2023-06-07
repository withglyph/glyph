<script lang="ts">
  import clsx from 'clsx';
  import { Tooltip } from '$lib/components';

  let _class: string;
  export { _class as class };
  export let name: string;
  export let active = false;
</script>

<Tooltip message={name} placement="top">
  <button
    class="square-10 flex center rounded hover:bg-gray-100"
    type="button"
    on:click
  >
    <span class={clsx('square-6', _class, active && 'text-brand-500')} />
  </button>
</Tooltip>
