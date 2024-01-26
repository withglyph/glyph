<script lang="ts">
  import clsx from 'clsx';
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  export let variant: 'primary' | 'secondary' = 'primary';
  let _class: string | undefined = undefined;
  export { _class as class };

  let _search: string | undefined = undefined;
  export { _search as search };
  let search = writable<string | undefined>();

  setContext('variant', variant);
  setContext('search', search);

  $: $search = _search;
</script>

<ul
  class={clsx(
    'flex w-fit',
    variant === 'primary' && 'gap-2',
    variant === 'secondary' && 'border-b border-secondary',
    _class,
  )}
  role="tablist"
>
  <slot />
</ul>
