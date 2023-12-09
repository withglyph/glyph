<script lang="ts">
  import { TiptapEditor } from '$lib/tiptap/components';
  import TiptapLinkEditMenu from '$lib/tiptap/components/TiptapLinkEditMenu.svelte';
  import ArticleBubbleMenu from './ArticleBubbleMenu.svelte';
  import ArticleFloatingMenu from './ArticleFloatingMenu.svelte';
  import type { Editor, JSONContent } from '@tiptap/core';

  export let content: JSONContent | undefined;
  export let editor: Editor | undefined;
  export let onChange: () => void;
</script>

<div class="mx-auto w-full max-w-230 flex grow">
  <TiptapEditor class="mt-12 mb-100px max-w-full grow" {onChange} bind:editor bind:content />
</div>

{#if editor}
  <ArticleBubbleMenu {editor} />
  <ArticleFloatingMenu {editor} />
  <TiptapLinkEditMenu {editor} />
{/if}
