<script lang="ts">
  import { clsx } from 'clsx';
  import type { HTMLInputAttributes } from 'svelte/elements';

  export let name: HTMLInputAttributes['name'] = undefined;
  export let value: HTMLInputAttributes['value'] = undefined;
  let _class: HTMLInputAttributes['class'] = undefined;
  export { _class as class };

  type $$Props = HTMLInputAttributes;
  type $$Events = {
    input: Parameters<NonNullable<HTMLInputAttributes['on:input']>>[0];
  };
</script>

<form class={clsx('relative h-11.5', _class)} on:submit|preventDefault>
  <input
    {name}
    class="rounded-2.5 h-11.5 w-full bg-primary py-1.75 pr-3.5 pl-11 border border-bg-primary transition focus-within:border-tertiary"
    type="search"
    bind:value
    on:input
    {...$$restProps}
  />
  <div class="absolute inset-y-0 left-3.5 flex center text-secondary h-100%">
    <i class="i-lc-search square-5 transition" aria-label="검색 아이콘" />
  </div>
</form>
