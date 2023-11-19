<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import Editor from './Editor.svelte';
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';
  import type { Editor as TiptapEditor, JSONContent } from '@tiptap/core';
  import type { PostKind } from '$glitch';

  $: query = graphql(`
    query EditorPage_Query {
      ...EditorPage_Header_query
    }
  `);

  let kind: PostKind = 'ARTICLE';

  let title: string;
  let subtitle: string | null = null;
  let editor: TiptapEditor | undefined;
  let content: JSONContent | undefined;
  let tags: string[] = [];
</script>

<Helmet title="새 포스트 작성하기" />

<Header {$query} {content} {editor} {subtitle} {title} bind:kind />
<Editor {kind} bind:title bind:editor bind:subtitle bind:content />
<Footer bind:tags />
