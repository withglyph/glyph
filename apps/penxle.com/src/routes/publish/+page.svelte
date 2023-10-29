<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import { warnOnUnload } from '$lib/svelte/lifecycle';
  import Editor from './Editor.svelte';
  import Header from './Header.svelte';
  import Toolbar from './Toolbar.svelte';
  import type { Editor as TiptapEditor } from '@tiptap/core';

  warnOnUnload();

  $: query = graphql(`
    query PublishPage_Query {
      ...PublishPage_Header_query
    }
  `);

  let title: string;
  let subtitle: string;
  let editor: TiptapEditor;
</script>

<Helmet title="새 글 작성하기" />

<main class="flex grow flex-col">
  <Header {$query} bind:title bind:editor bind:subtitle />
  <Editor bind:title bind:editor bind:subtitle />
  <Toolbar {editor} />
</main>
