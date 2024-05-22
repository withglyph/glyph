<script lang="ts">
  import stringify from 'fast-json-stable-stringify';
  import { onFlutterMessage } from '$lib/flutter';
  import { TiptapRenderer } from '$lib/tiptap/components';
  import { css } from '$styled-system/css';
  import type { JSONContent } from '@tiptap/core';

  let content: JSONContent | null = null;

  onFlutterMessage((message) => {
    if (message.type === 'content') {
      content = message.content;
    }
  });
</script>

<div class={css({ paddingX: '20px' })}>
  {#if content}
    {#key stringify(content)}
      <TiptapRenderer {content} />
    {/key}
  {/if}
</div>
