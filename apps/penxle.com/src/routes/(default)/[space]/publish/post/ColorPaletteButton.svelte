<script lang="ts">
  import { clsx } from 'clsx';

  let _class = '';
  export { _class as class };
  export let active = false;
  export let enabled = true;
</script>

<button
  disabled={!enabled}
  type="button"
  on:click
  class={clsx(
    'square-10 flex center rounded-3xl enabled:hover:bg-gray-10',
    _class,
    active && 'b-2 border-gray-20',
    !enabled && 'opacity-10',
  )}
/>
