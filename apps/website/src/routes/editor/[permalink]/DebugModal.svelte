<script lang="ts">
  import { NodeSelection } from '@tiptap/pm/state';
  import { codeToHtml } from 'shiki';
  import { Button, Modal } from '$lib/components/v2';
  import { css } from '$styled-system/css';
  import { getEditorContext } from './context';
  import type { ResolvedPos } from '@tiptap/pm/model';

  const { state } = getEditorContext();

  export let open = false;

  const resolvedPosToJson = (pos: ResolvedPos) => ({
    pos: pos.pos,
    depth: pos.depth,
  });

  $: selection = $state.editor && {
    type: $state.editor.state.selection.toJSON().type,
    node:
      $state.editor.state.selection instanceof NodeSelection ? $state.editor.state.selection.node.type.name : undefined,
    size: $state.editor.state.selection.content().size,
    from: resolvedPosToJson($state.editor.state.selection.$from),
    to: resolvedPosToJson($state.editor.state.selection.$to),
  };
  $: content = $state.editor?.getJSON();
</script>

<Modal size="lg" bind:open>
  <svelte:fragment slot="title">에디터 상태</svelte:fragment>
  <div class={css({ fontFamily: 'mono', fontSize: '11px' })}>
    <div class={css({ marginBottom: '8px', fontWeight: 'bold' })}>Selection</div>
    {#if selection}
      {#await codeToHtml(JSON.stringify(selection, null, 2), { lang: 'json', theme: 'github-light-default' }) then html}
        {@html html}
      {:catch error}
        {error.message}
      {/await}
    {/if}
  </div>

  <hr class={css({ marginY: '16px' })} />

  <div class={css({ fontFamily: 'mono', fontSize: '11px' })}>
    <div class={css({ marginBottom: '8px', fontWeight: 'bold' })}>Content</div>
    {#if content}
      {#await codeToHtml(JSON.stringify(content, null, 2), { lang: 'json', theme: 'github-light-default' }) then html}
        {@html html}
      {:catch error}
        {error.message}
      {/await}
    {/if}
  </div>

  <svelte:fragment slot="action">
    <Button size="lg" variant="gray-primary-fill" on:click={() => (open = false)}>닫기</Button>
  </svelte:fragment>
</Modal>
