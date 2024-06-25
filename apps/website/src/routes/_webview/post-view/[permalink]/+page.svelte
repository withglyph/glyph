<script lang="ts">
  import stringify from 'fast-json-stable-stringify';
  import { onMount } from 'svelte';
  import { graphql } from '$glitch';
  import { postFlutterMessage } from '$lib/flutter';
  import { TiptapRenderer } from '$lib/tiptap/components';
  import { css } from '$styled-system/css';
  import type { Editor } from '@tiptap/core';

  $: query = graphql(`
    query WebViewPostViewPermalinkPage_Query($permalink: String!) {
      post(permalink: $permalink) {
        id
        permalink

        publishedRevision @_required {
          id
          content
        }
      }
    }
  `);

  let editor: Editor | undefined;

  $: if (editor) {
    editor.storage.permalink = $query.post.permalink;
    editor.storage.revisionId = $query.post.publishedRevision.id;
  }

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
  {#key stringify($query.post.publishedRevision.content)}
    <TiptapRenderer content={$query.post.publishedRevision.content} bind:editor />
  {/key}
</div>
