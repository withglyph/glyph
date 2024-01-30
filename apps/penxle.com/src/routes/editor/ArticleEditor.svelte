<script lang="ts">
  import { TiptapEditor } from '$lib/tiptap/components';
  import ArticleBubbleMenu from './ArticleBubbleMenu.svelte';
  import ArticleFloatingMenu from './ArticleFloatingMenu.svelte';
  import ArticleLinkEditMenu from './ArticleLinkEditMenu.svelte';
  import ArticleRubyEditMenu from './ArticleRubyEditMenu.svelte';
  import type { Editor, JSONContent } from '@tiptap/core';

  export let content: JSONContent | undefined;
  export let editor: Editor | undefined;
  export let autoIndent: boolean;
  export let onChange: () => void;
</script>

<div class="mx-auto w-full max-w-230 flex grow">
  <TiptapEditor class="mt-12 mb-100px max-w-full grow" {autoIndent} {onChange} bind:editor bind:content />
</div>

{#if editor}
  <ArticleBubbleMenu {editor} />
  <ArticleFloatingMenu {editor} />
  <ArticleLinkEditMenu {editor} />
  <ArticleRubyEditMenu {editor} />
{/if}
