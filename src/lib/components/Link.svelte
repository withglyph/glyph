<script lang="ts">
  import clsx from 'clsx';

  let _class: string | undefined = undefined;
  export { _class as class };
  export let href: string | undefined = undefined;
  export let colored = false;
  export let external = false;
</script>

<a
  class={clsx(
    'hover:underline underline-offset-2',
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
