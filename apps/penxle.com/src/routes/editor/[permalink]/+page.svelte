<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { onDestroy, setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { graphql } from '$glitch';
  import Editor from '../Editor.svelte';
  import Footer from '../Footer.svelte';
  import Header from '../Header.svelte';
  import type { Editor as TiptapEditor, JSONContent } from '@tiptap/core';
  import type { PostRevisionContentKind } from '$glitch';
  import type { ImageBounds } from '$lib/utils';
  import type { RestoredRevision } from '../restore-revision';

  $: query = graphql(`
    query EditorPermalinkPage_Query($permalink: String!) {
      ...EditorPage_Header_query

      post(permalink: $permalink) {
        id
        ...EditorPage_Header_post

        draftRevision {
          id
          kind
          contentKind
          content
          title
          subtitle
          thumbnailBounds

          originalThumbnail {
            id
            ...Image_image
          }

          tags {
            id
            name
          }
        }
      }
    }
  `);

  let title: string;
  let subtitle: string | null = null;
  let editor: TiptapEditor | undefined;
  let content: JSONContent | undefined;
  let tags: string[];
  let thumbnailId: string | undefined = undefined;
  let thumbnailBounds: ImageBounds | undefined = undefined;
  let kind: PostRevisionContentKind;

  let initialized = false;

  let restoredRevision = writable<RestoredRevision>(null);
  const resetRestored = () => {
    restoredRevision.set(null);
  };
  setContext('restoredRevision', restoredRevision);

  const unsubscriber = restoredRevision.subscribe((revision) => {
    if (revision === null) return;
    if (!editor) throw new Error('editor is not initialize');

    title = revision.title;
    subtitle = revision.subtitle ?? null;
    editor.commands.setContent(revision.content);
    kind = revision.contentKind;
    tags = revision.tags.map(({ name }) => name);
  });

  onDestroy(() => {
    unsubscriber();
  });

  $: if (!initialized) {
    initialized = true;

    title = $query.post.draftRevision.title;
    subtitle = $query.post.draftRevision.subtitle ?? null;
    content = $query.post.draftRevision.content;
    tags = $query.post.draftRevision.tags.map((tag) => tag.name);
    kind = $query.post.draftRevision.contentKind;
    thumbnailBounds = $query.post.draftRevision.thumbnailBounds;
    thumbnailId = $query.post.draftRevision.originalThumbnail?.id;
  }
</script>

<Helmet title="포스트 수정하기" />

<Header
  $post={$query.post}
  {$query}
  {content}
  {editor}
  {resetRestored}
  restored={$restoredRevision !== null}
  {subtitle}
  {tags}
  {thumbnailBounds}
  {thumbnailId}
  {title}
  bind:kind
/>
<Editor
  handleKeyDown={resetRestored}
  {kind}
  bind:title
  bind:editor
  bind:subtitle
  bind:content
  bind:thumbnailId
  bind:thumbnailBounds
/>
<Footer {kind} bind:content bind:tags bind:thumbnailBounds bind:thumbnailId />
