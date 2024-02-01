<script lang="ts">
  import clsx from 'clsx';

  const firstChild = ['[&>*:first-child]:(rounded-r-none)', '[&>*:first-child:not(:has(:checked))]:(border-r-none)'];
  const notFirstOrLastChild = '[&>*:not(:first-child,:last-child)]:rounded-(l-none r-none)';
  const resetBorder = '[&>*:not(:first-child,:last-child,:has(:checked))]:border-r-none';
  const resetSelectedChildNextSibling = '[&>*:has(:checked)+*]:border-l-none';
  const lastChild = '[&>*:last-child]:rounded-l-none';
</script>

<div
  class={clsx(
    'flex [&>*]:flex-1',
    firstChild,
    notFirstOrLastChild,
    resetBorder,
    resetSelectedChildNextSibling,
    lastChild,
  )}
  role="group"
>
  <slot />
</div>
