<script lang="ts">
  import clsx from 'clsx';

  let _class: string | undefined = undefined;
  export { _class as class };
</script>

<table class={clsx('w-full border-spacing-0 <sm:table-fixed', _class)}>
  <slot />
</table>
