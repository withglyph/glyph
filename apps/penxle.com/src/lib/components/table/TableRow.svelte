<script lang="ts">
  import { clsx } from 'clsx';
  import type { SvelteHTMLElements } from 'svelte/elements';

  type HTMLTableRowElement = SvelteHTMLElements['tr'];

  let _class: string | HTMLTableRowElement['class'] = undefined;
  export { _class as class };

  type $$Props = HTMLTableRowElement;
</script>

<tr class={clsx('truncate [&>td]:(border-b last-of-type:border-b-none)', _class)} {...$$restProps}>
  <slot />
</tr>
