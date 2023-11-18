<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import Editor from '../Editor';
  import Footer from '../Footer.svelte';
  import Header from '../Header';
  import type { Editor as TiptapEditor, JSONContent } from '@tiptap/core';
  import type { PublishPage_Header_PostOption } from '../types';

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
  let subtitle: string | null = null;
  let editor: TiptapEditor | undefined;
  let content: JSONContent | undefined;
  let postOption: PublishPage_Header_PostOption;
  let permalink: string;
  let tags: string[];

  $: if (content?.content === undefined) {
    content = $query.post.revision.content;
  }

  $: if (tags === undefined) {
    tags = $query.post.tags.map(({ tag }) => tag.name);
  }

  $: title = $query.post.revision.title;
  $: subtitle = $query.post.revision.subtitle ?? null;

  $: postOption = {
    discloseStats: $query.post.option.discloseStats,
    hasPassword: $query.post.option.hasPassword,
    receiveFeedback: $query.post.option.receiveFeedback,
    receivePatronage: $query.post.option.receivePatronage,
    receiveTagContribution: $query.post.option.receiveTagContribution,
    visibility: $query.post.option.visibility,
    postId: $query.post.id,
    tags,
    contentFilters: $query.post.contentFilters,
  };

  $: permalink = $page.params.permalink;
</script>

<Helmet title="글 수정하기" />

<Header {$query} {content} {editor} {permalink} {postOption} {subtitle} {title} />
<Editor bind:title bind:editor bind:subtitle bind:content />
<Footer bind:tags />
