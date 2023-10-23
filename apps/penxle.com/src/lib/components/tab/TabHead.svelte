<script lang="ts">
  import clsx from 'clsx';

  export let variant: 'primary' | 'secondary' = 'primary';
  let _class: string | undefined = undefined;
  export { _class as class };
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
