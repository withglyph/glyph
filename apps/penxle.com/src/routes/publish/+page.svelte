<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import { warnOnUnload } from '$lib/svelte/lifecycle';
  import Editor from './Editor.svelte';
  import Header from './Header.svelte';
  import Toolbar from './Toolbar.svelte';
  import type { Editor as TiptapEditor, JSONContent } from '@tiptap/core';

  warnOnUnload();

  $: query = graphql(`
    query PublishPage_Query {
      ...PublishPage_Header_query
    }
  `);

  let title: string;
  let subtitle: string;
  let editor: TiptapEditor;
  let content: JSONContent;
  let steps: unknown[] = [];
</script>

<Helmet title="새 글 작성하기" />

<main class="flex grow flex-col">
  <Header {$query} {content} {subtitle} {title} bind:steps />
  <Editor bind:title bind:editor bind:subtitle bind:content bind:steps />
  <Toolbar {editor} />
</main>
