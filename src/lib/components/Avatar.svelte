<script lang="ts">
  import clsx from 'clsx';
  import Image from './Image.svelte';

  let _class: string | undefined = undefined;
  export { _class as class };
  export let src: string;
</script>

<Image class={clsx('rounded-full', _class)} {src} />
