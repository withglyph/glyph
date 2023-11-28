<script lang="ts">
  import { clsx } from 'clsx';
  import type { HTMLInputAttributes } from 'svelte/elements';

  export let name: HTMLInputAttributes['name'] = undefined;
  export let value: HTMLInputAttributes['value'] = undefined;
  let _class: HTMLInputAttributes['class'] = undefined;
  export { _class as class };

  type $$Props = HTMLInputAttributes;
</script>

<form class={clsx('relative h-11.5 max-w-82.5', _class)}>
  <input
    {name}
    class="rounded-2.5 h-11.5 w-full bg-primary py-1.75 pr-3.5 pl-11"
    type="text"
    bind:value
    on:input
    {...$$restProps}
  />
  <div class="absolute inset-y-0 left-3.5 flex center text-secondary h-100%">
    <span class="i-lc-search square-5 transition" aria-label="검색 아이콘" />
  </div>
</form>
