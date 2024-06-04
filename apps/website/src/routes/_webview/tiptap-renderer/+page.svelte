<script lang="ts">
  import stringify from 'fast-json-stable-stringify';
  import { onFlutterMessage } from '$lib/flutter';
  import { TiptapRenderer } from '$lib/tiptap/components';
  import { css } from '$styled-system/css';
  import type { Editor, JSONContent } from '@tiptap/core';

  let editor: Editor | undefined = undefined;
  let content: JSONContent | null = null;

  onFlutterMessage((message) => {
    if (message.type === 'info' && editor) {
      editor.storage.permalink = message.permalink;
      editor.storage.revisionId = message.revisionId;
    }

    if (message.type === 'content') {
      content = message.content;
    }
  });
</script>

<div class={css({ paddingX: '20px' })}>
  {#if content}
    {#key stringify(content)}
      <TiptapRenderer {content} bind:editor />
    {/key}
  {/if}
</div>
