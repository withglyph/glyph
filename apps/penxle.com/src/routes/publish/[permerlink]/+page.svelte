<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import Editor from '../Editor.svelte';
  import Footer from '../Footer.svelte';
  import Header from '../Header.svelte';
  import type { Editor as TiptapEditor, JSONContent } from '@tiptap/core';

  $: query = graphql(`
    query Publish_Permerlink_Page_Query($permalink: String!) {
      ...PublishPage_Header_query

      post(permalink: $permalink) {
        id

        revision {
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
  let subtitle: string;
  let editor: TiptapEditor;
  let content: JSONContent;

  let tags: string[] = [];

  $: title = $query.post?.title;
  $: subtitle = $query.post?.revision?.subtitle;
  $: content = $query.post?.revision?.content;
</script>

<Helmet title="글 수정하기" />

<Header {$query} {content} {editor} {subtitle} {tags} {title} />
<Editor bind:title bind:editor bind:subtitle bind:content />
<Footer bind:tags />
