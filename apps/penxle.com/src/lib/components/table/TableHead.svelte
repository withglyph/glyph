<script lang="ts">
  import clsx from 'clsx';

  let _class: string | undefined = undefined;
  export { _class as class };
</script>

<th
  class={clsx(
    'border-y border-secondary py-2 first-of-type:(border-l rounded-l-lg pl-4) last-of-type:(border-r rounded-r-lg pr-4)',
    _class,
  )}
  scope="col"
>
  <slot />
</th>
