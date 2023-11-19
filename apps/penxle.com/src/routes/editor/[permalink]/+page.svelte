<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import Editor from '../Editor.svelte';
  import Footer from '../Footer.svelte';
  import Header from '../Header.svelte';
  import type { Editor as TiptapEditor, JSONContent } from '@tiptap/core';

  $: query = graphql(`
    query EditorPermalinkPage_Query($permalink: String!) {
      ...EditorPage_Header_query

      post(permalink: $permalink) {
        id
        kind
        ...EditorPage_Header_post

        draftRevision {
          id
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

  let initialized = false;

  $: if (!initialized) {
    initialized = true;

    title = $query.post.draftRevision.title;
    subtitle = $query.post.draftRevision.subtitle ?? null;
    content = $query.post.draftRevision.content;
    tags = $query.post.tags.map(({ tag }) => tag.name);
  }
</script>

<Helmet title="포스트 수정하기" />

<Header $post={$query.post} {$query} {content} {editor} kind={$query.post.kind} {subtitle} {title} />
<Editor kind={$query.post.kind} bind:title bind:editor bind:subtitle bind:content />
<Footer bind:tags />
