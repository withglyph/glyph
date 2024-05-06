<script lang="ts">
  import { codeToHtml } from 'shiki';
  import { Button, Modal } from '$lib/components/v2';
  import { css } from '$styled-system/css';
  import { getEditorContext } from './context';

  const { state } = getEditorContext();

  export let open = false;

  $: content = $state.editor?.getJSON();
</script>

<Modal size="lg" bind:open>
  <svelte:fragment slot="title">에디터 상태</svelte:fragment>
  <div class={css({ fontFamily: 'mono', fontSize: '11px' })}>
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
