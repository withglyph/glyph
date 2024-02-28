<script lang="ts">
  import { onDestroy } from 'svelte';
  import { css } from '$styled-system/css';
  import type { SystemStyleObject } from '$styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;
  export let file: File;

  const src = URL.createObjectURL(file);

  onDestroy(() => {
    URL.revokeObjectURL(src);
  });
</script>

<img class={css(style)} alt="" {src} />
