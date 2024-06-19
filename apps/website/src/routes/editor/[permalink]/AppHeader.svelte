<script lang="ts">
  import './toolbar-preview.css';

  import { fragment, graphql } from '$glitch';
  import { onFlutterMessage } from '$lib/flutter';
  import { portal } from '$lib/svelte/actions';
  import { css } from '$styled-system/css';
  import { getEditorContext } from './context';
  import MobileEditMenu from './MobileEditMenu.svelte';
  import PublishMenu from './PublishMenu.svelte';
  import type { EditorPage_AppHeader_post, EditorPage_AppHeader_query } from '$glitch';

  export { _post as $post, _query as $query };
  let _query: EditorPage_AppHeader_query;
  let _post: EditorPage_AppHeader_post;

  const { state } = getEditorContext();

  $: query = fragment(
    _query,
    graphql(`
      fragment EditorPage_AppHeader_query on Query {
        ...EditorPage_PublishMenu_query
      }
    `),
  );

  $: post = fragment(
    _post,
    graphql(`
      fragment EditorPage_AppHeader_post on Post {
        id
        permalink

        ...EditorPage_PublishMenu_post
      }
    `),
  );

  let publishMenuOpen = false;

  onFlutterMessage((message) => {
    if (message.type === 'publish:open') {
      publishMenuOpen = true;
    }
  });
</script>

{#if $state.editor?.isFocused}
  <header
    class={css({
      position: 'fixed',
      bottom: '0',
      width: 'full',
      backgroundColor: 'gray.0',
      zIndex: '100',
    })}
  >
    <MobileEditMenu />
  </header>
{/if}

{#if publishMenuOpen}
  <div
    class={css({ position: 'fixed', inset: '0', zIndex: '40', backgroundColor: 'gray.900/50' })}
    role="button"
    tabindex="-1"
    on:click={() => (publishMenuOpen = false)}
    on:keypress={null}
    use:portal
  />
{/if}

<div class={css({ position: 'fixed', left: '0', bottom: '0', width: 'full', zIndex: '50' })} use:portal>
  <PublishMenu {$post} {$query} bind:open={publishMenuOpen} />
</div>
