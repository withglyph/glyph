<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import Editor from '../Editor.svelte';
  import Footer from '../Footer.svelte';
  import Header from '../Header.svelte';
  import type { PostRevision } from '@prisma/client';
  import type { Editor as TiptapEditor, JSONContent } from '@tiptap/core';
  import type { UpdatePostOptionsInput } from '$lib/validations/post';

  $: query = graphql(`
    query Publish_Permalink_Page_Query($permalink: String!) {
      ...PublishPage_Header_query

      post(permalink: $permalink) {
        id

        contentFilters

        option {
          discloseStats
          hasPassword
          id
          receiveFeedback
          receivePatronage
          receiveTagContribution
          visibility
        }

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
  let subtitle: PostRevision['subtitle'];
  let editor: TiptapEditor;
  let content: JSONContent;
  let postOption: UpdatePostOptionsInput;
  let permalink: string;

  onMount(() => {
    content = $query.post.revision.content;
  });

  $: title = $query.post.revision.title;
  $: subtitle = $query.post.revision.subtitle ?? null;
  $: content = $query.post.revision.content;

  $: postOption = {
    ...$query.post.option,
    postId: $query.post.id,
    tags: $query.post.tags.map(({ tag }) => tag.name),
    contentFilters: $query.post.contentFilters,
  };

  $: permalink = $page.params.permalink;
</script>

<Helmet title="글 수정하기" />

<Header {$query} {content} {editor} {permalink} {postOption} {subtitle} {title} />
<Editor bind:title bind:editor bind:subtitle bind:content />
<Footer bind:tags={postOption.tags} />
