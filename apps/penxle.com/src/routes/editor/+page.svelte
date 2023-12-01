<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import Editor from './Editor.svelte';
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';
  import type { Editor as TiptapEditor, JSONContent } from '@tiptap/core';
  import type { PostRevisionContentKind } from '$glitch';
  import type { ImageBounds } from '$lib/utils';

  $: query = graphql(`
    query EditorPage_Query {
      ...EditorPage_Header_query
    }
  `);

  let kind: PostRevisionContentKind = 'ARTICLE';

  let title: string;
  let subtitle: string | null = null;
  let editor: TiptapEditor | undefined;
  let content: JSONContent | undefined;
  let tags: string[] = [];
  let thumbnailId: string | undefined = undefined;
  let thumbnailBounds: ImageBounds | undefined = undefined;
</script>

<Helmet title="새 포스트 작성하기" />

<Header {$query} {content} {editor} {subtitle} {tags} {thumbnailBounds} {thumbnailId} {title} bind:kind />
<Editor {kind} bind:title bind:editor bind:subtitle bind:content bind:thumbnailBounds bind:thumbnailId />
<Footer {kind} bind:tags bind:content />
