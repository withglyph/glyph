<script lang="ts">
  import { clsx } from 'clsx';
  import type { SvelteHTMLElements } from 'svelte/elements';

  type HTMLTableRowElement = SvelteHTMLElements['tr'];

  let _class: string | HTMLTableRowElement['class'] = undefined;
  export { _class as class };

  type $$Props = HTMLTableRowElement;
</script>

<tr
  class={clsx('truncate first-of-type:(bg-primary text-secondary body-13-b) [&:nth-of-type(2)>*]:border-none', _class)}
  {...$$restProps}
>
  <slot />
</tr>
