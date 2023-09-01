<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql, useQuery } from '$lib/houdini';
  import { warnOnUnload } from '$lib/svelte/lifecycle';
  import Editor from './Editor.svelte';
  import Header from './Header.svelte';
  import Toolbar from './Toolbar.svelte';
  import type { Editor as TiptapEditor } from '@tiptap/core';

  warnOnUnload();

  $: query = useQuery(
    graphql(`
      query SpacePublishPostPage_Query($slug: String!) @load {
        ...SpacePublishPostPage_Header_query @with(slug: $slug)
      }
    `),
  );

  let editor: TiptapEditor | undefined;
</script>

<Helmet title="새 글 작성하기" />

<main class="flex grow flex-col">
  <Header _query={$query} />
  <Editor bind:editor />
  <Toolbar {editor} />
</main>
