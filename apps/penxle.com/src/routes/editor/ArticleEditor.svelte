<script lang="ts">
  import { TiptapEditor } from '$lib/tiptap/components';
  import ArticleLinkEditMenu from './ArticleLinkEditMenu.svelte';
  import ArticleRubyEditMenu from './ArticleRubyEditMenu.svelte';
  import type { Editor, JSONContent } from '@tiptap/core';

  export let content: JSONContent | undefined;
  export let editor: Editor | undefined;
  export let paragraphIndent: number;
  export let paragraphSpacing: number;
  export let onChange: () => void;
</script>

<div class="px-15 w-full flex grow">
  <TiptapEditor
    class="mb-100px max-w-full grow"
    {onChange}
    {paragraphIndent}
    {paragraphSpacing}
    bind:editor
    bind:content
  />
</div>

{#if editor}
  <ArticleLinkEditMenu {editor} />
  <ArticleRubyEditMenu {editor} />
{/if}
