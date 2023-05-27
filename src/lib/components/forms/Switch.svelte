<script lang="ts">
  import clsx from 'clsx';
  import type { HTMLInputAttributes } from 'svelte/elements';

  export let checked: HTMLInputAttributes['checked'] = false;
  let _class: HTMLInputAttributes['class'] = undefined;
  export { _class as class };

  type $$Props = HTMLInputAttributes;
</script>

<input
  class={clsx(
    'relative flex w-10 aspect-2/1 p-1 rounded-full transition appearance-none bg-gray-200 justify-start checked:(bg-brand-500 justify-end) after:(rounded-full content-empty bg-white h-full aspect-1/1)',
    _class
  )}
  type="checkbox"
  bind:checked
  {...$$restProps}
/>
