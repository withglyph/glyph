<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import Editor from './Editor';
  import Footer from './Footer.svelte';
  import Header from './Header';
  import type { Editor as TiptapEditor, JSONContent } from '@tiptap/core';
  import type { PublishPage_Header_PostOption } from './types';

  $: query = graphql(`
    query PublishPage_Query {
      ...PublishPage_Header_query
    }
  `);

  let title: string;
  let subtitle: string;
  let editor: TiptapEditor;
  let content: JSONContent;

  let tags: string[] = [];

  let defaultPostOption: PublishPage_Header_PostOption;

  $: defaultPostOption = {
    tags,
    hasPassword: false,
    contentFilters: [],
    // @ts-expect-error: 포스트 발행 페이지 초기 시점에는 postId 가 없어 단언을 했습니다.
    postId: undefined as string,
    visibility: 'PUBLIC' as const,
  };
</script>

<Helmet title="새 글 작성하기" />

<Header {$query} {content} {editor} postOption={defaultPostOption} {subtitle} {title} />
<Editor bind:title bind:editor bind:subtitle bind:content />
<Footer bind:tags />
