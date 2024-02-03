<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import Editor from './Editor.svelte';

  $: query = graphql(`
    query EditorPermalinkPage_Query($permalink: String!) {
      ...EditorPage_Editor_query

      post(permalink: $permalink) {
        id
        ...EditorPage_Editor_post
      }
    }
  `);
</script>

<Helmet title="포스트 수정하기" />

{#key $query.post.id}
  <Editor $post={$query.post} {$query} />
{/key}
