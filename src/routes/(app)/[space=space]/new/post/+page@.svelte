<script lang="ts">
  import { Helmet } from '$lib/components';
  import Editor from './Editor.svelte';
  import Header from './Header.svelte';
  import Toolbar from './Toolbar.svelte';
  import type { Editor as TiptapEditor } from '@tiptap/core';

  let editor: TiptapEditor | undefined;
</script>

<Helmet title="새 포스트 작성하기" />

<main class="flex grow flex-col">
  <Header />
  <Editor bind:editor />
  <Toolbar bind:editor />
</main>
