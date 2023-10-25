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
    query SpacePublishPostPage_Query($slug: String!) {
      ...SpacePublishPostPage_Header_query

      space(slug: $slug) {
        id
        ...SpacePublishPostPage_Header_space
      }
    }
  `);

  let title: string | undefined;
  let subtitle: string | undefined;
  let editor: TiptapEditor | undefined;
</script>

<Helmet title="새 글 작성하기" />

<main class="flex grow flex-col">
  <Header {$query} $space={$query.space} bind:title bind:editor bind:subtitle />
  <Editor bind:title bind:editor bind:subtitle />
  <Toolbar {editor} />
</main>
