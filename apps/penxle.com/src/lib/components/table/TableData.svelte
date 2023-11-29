<script lang="ts">
  import clsx from 'clsx';

  let _class: string | undefined = undefined;
  export { _class as class };
</script>

<td class={clsx('py-4 border-t first-of-type:pl-4 pr-4 truncate whitespace-nowrap', _class)}>
  <slot />
</td>
