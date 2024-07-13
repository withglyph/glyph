<script lang="ts">
  import { onMount } from 'svelte';
  import { postFlutterMessage } from '$lib/flutter';
  import { TiptapRenderer } from '$lib/tiptap/components';
  import { css } from '$styled-system/css';

  export let form;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  $: node = JSON.parse(form!.node);
  $: content = {
    type: 'doc',
    content: [
      {
        type: 'document',
        content: [node],
      },
    ],
  };

  onMount(() => {
    const observer = new ResizeObserver((entries) => {
      postFlutterMessage({ type: 'resize', height: entries[0].contentRect.height });
    });

    observer.observe(document.body);

    return () => {
      observer.disconnect();
    };
  });
</script>

<div class={css({ paddingX: '20px' })}>
  <TiptapRenderer {content} />
</div>
