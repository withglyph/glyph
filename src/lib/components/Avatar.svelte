<script lang="ts">
  import clsx from 'clsx';

  let _class: string | undefined = undefined;
  export { _class as class };
  export let src: string;
</script>

<img class={clsx('rounded-full', _class)} {src} />
