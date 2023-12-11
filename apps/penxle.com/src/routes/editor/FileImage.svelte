<script lang="ts">
  import { onDestroy } from 'svelte';

  let _class: string | undefined = undefined;
  export { _class as class };
  export let file: File;

  const src = URL.createObjectURL(file);

  onDestroy(() => {
    URL.revokeObjectURL(src);
  });
</script>

<img class={_class} alt="" {src} />
