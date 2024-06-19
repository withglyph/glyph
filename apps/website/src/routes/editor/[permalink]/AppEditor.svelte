<script lang="ts">
  import { fragment, graphql } from '$glitch';
  import { flex } from '$styled-system/patterns';
  import AppHeader from './AppHeader.svelte';
  import Content from './Content.svelte';
  import type { EditorPage_AppEditor_post, EditorPage_AppEditor_query } from '$glitch';

  export { _post as $post, _query as $query };
  let _query: EditorPage_AppEditor_query;
  let _post: EditorPage_AppEditor_post;

  $: query = fragment(
    _query,
    graphql(`
      fragment EditorPage_AppEditor_query on Query {
        ...EditorPage_AppHeader_query
      }
    `),
  );

  $: post = fragment(
    _post,
    graphql(`
      fragment EditorPage_AppEditor_post on Post {
        id

        ...EditorPage_AppHeader_post
      }
    `),
  );
</script>

<div class={flex({ grow: '1', position: 'relative', direction: 'column', overflow: 'hidden' })}>
  <div
    class={flex({
      grow: '1',
      overflow: 'auto',
    })}
  >
    <Content />
  </div>

  <AppHeader {$post} {$query} />
</div>
