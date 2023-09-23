<script lang="ts">
  import clsx from 'clsx';

  export let variant: 'primary' | 'secondary' = 'primary';
</script>

<div class="w-full">
  <ul class={clsx('flex flex-wrap w-full', variant === 'primary' && 'gap-2')} role="tablist">
    <slot />
  </ul>
</div>
