<script lang="ts">
  import { onDestroy } from 'svelte';

  export let file: File;
  let _class: string | undefined = undefined;
  export { _class as class };

  const src = URL.createObjectURL(file);

  onDestroy(() => {
    URL.revokeObjectURL(src);
  });
</script>

<img class={_class} alt="" {src} />
