<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { onDestroy, setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { graphql } from '$glitch';
  import Editor from './Editor.svelte';
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';
  import type { Editor as TiptapEditor, JSONContent } from '@tiptap/core';
  import type { PostRevisionContentKind } from '$glitch';
  import type { ImageBounds } from '$lib/utils';
  import type { RestoredRevision } from './restore-revision';

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

  let restoredRevision = writable<RestoredRevision>(null);
  setContext('restoredRevision', restoredRevision);

  const autoSaveCount = writable(0);

  const unsubscriber = restoredRevision.subscribe((revision) => {
    if (revision === null) return;
    if (!editor) throw new Error('editor is not initialize');

    title = revision.title;
    subtitle = revision.subtitle ?? null;
    editor.commands.setContent(revision.content);
    kind = revision.contentKind;
    tags = revision.tags.map(({ name }) => name);

    $autoSaveCount += 1;
  });

  onDestroy(() => {
    unsubscriber();
  });
</script>

<Helmet title="새 포스트 작성하기" />

<Header
  {$query}
  {autoSaveCount}
  {content}
  {editor}
  {subtitle}
  {tags}
  {thumbnailBounds}
  {thumbnailId}
  {title}
  bind:kind
/>
<Editor
  {autoSaveCount}
  {kind}
  bind:title
  bind:editor
  bind:subtitle
  bind:content
  bind:thumbnailBounds
  bind:thumbnailId
/>
<Footer {autoSaveCount} {kind} bind:content bind:tags bind:thumbnailBounds bind:thumbnailId />
