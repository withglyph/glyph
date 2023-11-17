<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import Editor from './Editor.svelte';
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';
  import type { Editor as TiptapEditor, JSONContent } from '@tiptap/core';

  $: query = graphql(`
    query PublishPage_Query {
      ...PublishPage_Header_query
    }
  `);

  let title: string;
  let subtitle: string;
  let editor: TiptapEditor;
  let content: JSONContent;

  let tags: string[] = [];
</script>

<Helmet title="새 글 작성하기" />

<Header {$query} {content} {editor} postOption={{ tags }} {subtitle} {title} />
<Editor bind:title bind:editor bind:subtitle bind:content />
<Footer bind:tags />
