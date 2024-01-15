<script lang="ts">
  import clsx from 'clsx';

  let _class: string | undefined = undefined;
  export { _class as class };
</script>

<thead class={clsx('[&>tr]:(bg-primary text-secondary body-13-b)', _class)}>
  <slot />
</thead>
