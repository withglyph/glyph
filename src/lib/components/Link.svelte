<script lang="ts">
  import { clsx } from 'clsx';

  let _class: string | undefined = undefined;
  export { _class as class };
  export let href: string;
  export let underline = false;
  export let colored = false;
  export let external = !href.startsWith('/');
</script>

<a
  class={clsx(
    underline && 'hover:underline underline-offset-2',
    colored && 'text-brand-500',
    _class
  )}
  {href}
  {...external && {
    target: '_blank',
    rel: 'noopener noreferrer',
  }}
>
  <slot />
</a>
