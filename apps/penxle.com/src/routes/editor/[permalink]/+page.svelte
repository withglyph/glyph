<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import Editor from '../Editor.svelte';
  import Footer from '../Footer.svelte';
  import Header from '../Header.svelte';
  import type { Editor as TiptapEditor, JSONContent } from '@tiptap/core';
  import type { PostRevisionContentKind } from '$glitch';

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
        }

        tags {
          id
          pinned

          tag {
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
  let thumbnailBounds: { top: number; left: number; width: number; height: number } | undefined = undefined;
  let kind: PostRevisionContentKind;

  let initialized = false;

  $: if (!initialized) {
    initialized = true;

    title = $query.post.draftRevision.title;
    subtitle = $query.post.draftRevision.subtitle ?? null;
    content = $query.post.draftRevision.content;
    tags = $query.post.tags.map(({ tag }) => tag.name);
    kind = $query.post.draftRevision.contentKind;
  }
</script>

<Helmet title="포스트 수정하기" />

<Header
  $post={$query.post}
  {$query}
  {content}
  {editor}
  {subtitle}
  {tags}
  {thumbnailBounds}
  {thumbnailId}
  {title}
  bind:kind
/>
<Editor {kind} bind:title bind:editor bind:subtitle bind:content bind:thumbnailId bind:thumbnailBounds />
<Footer {kind} bind:content bind:tags />
