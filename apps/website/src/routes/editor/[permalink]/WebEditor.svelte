<script lang="ts">
  import { onMount } from 'svelte';
  import { readable } from 'svelte/store';
  import { fragment, graphql } from '$glitch';
  import { Helmet } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import Content from './Content.svelte';
  import { getEditorContext } from './context';
  import FileHandler from './FileHandler.svelte';
  import TimeTravel from './TimeTravel.svelte';
  import WebHeader from './WebHeader.svelte';
  import type { EditorPage_WebEditor_post, EditorPage_WebEditor_query } from '$glitch';

  export { _post as $post, _query as $query };
  let _query: EditorPage_WebEditor_query;
  let _post: EditorPage_WebEditor_post;

  $: query = fragment(
    _query,
    graphql(`
      fragment EditorPage_WebEditor_query on Query {
        ...EditorPage_Header_query
      }
    `),
  );

  $: post = fragment(
    _post,
    graphql(`
      fragment EditorPage_WebEditor_post on Post {
        id

        ...EditorPage_Header_post
        ...EditorPage_TimeTravel_post
      }
    `),
  );

  const { state } = getEditorContext();

  const title = readable<string | null>(undefined, (set) => {
    const yText = $state.document.getText('title');
    const handler = () => {
      const value = yText.toString();
      set(value === '' ? null : value);
    };

    yText.observe(handler);
    return () => yText.unobserve(handler);
  });

  let vvHeight: number | undefined;

  const handleVisualViewportChange = () => {
    if (window.visualViewport) {
      vvHeight = window.visualViewport.height + window.visualViewport.offsetTop;
    }
  };

  onMount(() => {
    handleVisualViewportChange();
    window.visualViewport?.addEventListener('resize', handleVisualViewportChange);
    window.visualViewport?.addEventListener('scroll', handleVisualViewportChange);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleVisualViewportChange);
      window.visualViewport?.removeEventListener('scroll', handleVisualViewportChange);
    };
  });
</script>

<Helmet description="포스트 작성하기" title={`${$title ?? '(제목 없음)'} 작성`} />

<div
  class={css({ position: 'relative', flexGrow: '1', isolation: 'isolate', userSelect: 'none', touchAction: 'none' })}
>
  <div style:height={vvHeight ? `${vvHeight}px` : '100dvh'} class={flex({ direction: 'column' })}>
    <WebHeader {$post} {$query} />

    <div
      class={flex({
        direction: 'column',
        grow: '1',
        marginTop: $state.timeTravel ? '62px' : { base: '103px', sm: '168px' },
        overflow: 'auto',
      })}
    >
      {#if $state.timeTravel}
        <TimeTravel {$post} />
      {:else}
        <Content />
      {/if}
    </div>
  </div>
</div>

<FileHandler />
