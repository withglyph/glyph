<script lang="ts">
  import { TiptapEditor } from '$lib/tiptap/components';
  import ArticleBubbleMenu from './ArticleBubbleMenu.svelte';
  import ArticleFloatingMenu from './ArticleFloatingMenu.svelte';
  import type { Editor, JSONContent } from '@tiptap/core';

  export let content: JSONContent | undefined;
  export let editor: Editor | undefined;
</script>

<div class="mx-auto w-full max-w-230 flex grow">
  <TiptapEditor class="mt-12 mb-100px max-w-full grow whitespace-pre-wrap" bind:editor bind:content />
</div>

{#if editor}
  <ArticleBubbleMenu {editor} />
  <ArticleFloatingMenu {editor} />
{/if}
