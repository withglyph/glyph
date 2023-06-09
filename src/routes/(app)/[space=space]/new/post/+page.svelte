<script lang="ts">
  import { Helmet } from '$lib/components';
  import { graphql, useQuery } from '$lib/houdini';
  import { warnOnUnload } from '$lib/svelte/lifecycle';
  import Editor from './Editor.svelte';
  import Header from './Header.svelte';
  import Toolbar from './Toolbar.svelte';
  import type { Editor as TiptapEditor } from '@tiptap/core';

  warnOnUnload();

  const query = useQuery(
    graphql(`
      query SpaceNewPostPage_Query($slug: String!) @load {
        ...SpaceNewPostPage_Header_query @with(slug: $slug)
      }
    `)
  );

  let editor: TiptapEditor | undefined;
</script>

<Helmet title="새 포스트 작성하기" />

<main class="flex grow flex-col">
  <Header {$query} />
  <Editor bind:editor />
  <Toolbar {editor} />
</main>
