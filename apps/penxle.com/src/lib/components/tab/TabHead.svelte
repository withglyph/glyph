<script lang="ts">
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { css, cva } from '$styled-system/css';
  import type { SystemStyleObject } from '$styled-system/types';

  export let _variant: 'primary' | 'secondary' = 'primary';
  export { _variant as variant };
  let variant = writable<'primary' | 'secondary'>(_variant);

  export let style: SystemStyleObject | undefined = undefined;

  let _search: string | undefined = undefined;
  export { _search as search };
  let search = writable<string | undefined>(_search);

  setContext('variant', variant);
  setContext('search', search);

  $: $variant = _variant;
  $: $search = _search;

  const recipe = cva({
    base: { display: 'flex', width: 'fit' },
    variants: {
      variant: {
        primary: { gap: '8px' },
        secondary: { borderBottomWidth: '1px', borderBottomColor: 'gray.200' },
      },
    },
  });
</script>

<ul class={css(recipe.raw({ variant: _variant }), style)} role="tablist">
  <slot />
</ul>
