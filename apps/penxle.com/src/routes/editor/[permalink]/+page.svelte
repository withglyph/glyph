<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { onDestroy, setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { graphql } from '$glitch';
  import Editor from '../Editor.svelte';
  import Header from '../Header.svelte';
  import type { Editor as TiptapEditor, JSONContent } from '@tiptap/core';
  import type { RestoredRevision } from '../types/restore-revision';

  $: query = graphql(`
    query EditorPermalinkPage_Query($permalink: String!) {
      ...EditorPage_Header_query

      post(permalink: $permalink) {
        id
        ...EditorPage_Header_post

        draftRevision @_required {
          id
          kind
          contentKind
          editableContent
          title
          subtitle
          paragraphIndent
          paragraphSpacing
          thumbnailBounds

          originalThumbnail {
            id
            ...Image_image
          }
        }
      }
    }
  `);

  let title: string;
  let subtitle: string | null = null;
  let editor: TiptapEditor | undefined;
  let content: JSONContent;
  let paragraphIndent: number;
  let paragraphSpacing: number;

  let initialized = false;

  let restoredRevision = writable<RestoredRevision>(null);
  setContext('restoredRevision', restoredRevision);

  const autoSaveCount = writable(0);

  const unsubscriber = restoredRevision.subscribe((revision) => {
    if (!revision) return;
    if (!editor) throw new Error('editor is not initialize');

    title = revision.title;
    subtitle = revision.subtitle ?? null;
    editor.commands.setContent(revision.content);

    $autoSaveCount += 1;
  });

  onDestroy(() => {
    unsubscriber();
  });

  $: if (!initialized) {
    initialized = true;

    title = $query.post.draftRevision.title;
    subtitle = $query.post.draftRevision.subtitle ?? null;
    content = $query.post.draftRevision.content;
    paragraphIndent = $query.post.draftRevision.paragraphIndent;
    paragraphSpacing = $query.post.draftRevision.paragraphSpacing;
  }
</script>

<Helmet title="포스트 수정하기" />

<Header
  $post={$query.post}
  {$query}
  {autoSaveCount}
  {content}
  {editor}
  {subtitle}
  {title}
  bind:paragraphIndent
  bind:paragraphSpacing
/>
<Editor {autoSaveCount} {paragraphIndent} {paragraphSpacing} bind:title bind:editor bind:subtitle bind:content />
