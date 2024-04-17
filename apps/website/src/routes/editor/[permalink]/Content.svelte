<script lang="ts">
  import { onMount } from 'svelte';
  import { TiptapEditor } from '$lib/tiptap/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import { getEditorContext } from './context';
  import ArticleLinkEditMenu from './InlineLinkMenu.svelte';
  import ArticleRubyEditMenu from './InlineRubyMenu.svelte';
  import { createLoroStore } from './utils';

  const { state } = getEditorContext();

  const title = createLoroStore($state, 'title');
  const subtitle = createLoroStore($state, 'subtitle');

  onMount(() => {
    const saveEventHandler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', saveEventHandler);

    return () => {
      document.removeEventListener('keydown', saveEventHandler);
    };
  });
</script>

<main class={flex({ direction: 'column', grow: '1', backgroundColor: 'gray.50' })}>
  <div
    class={flex({
      direction: 'column',
      grow: '1',
      marginX: 'auto',
      paddingY: '20px',
      width: 'full',
      maxWidth: '940px',
      backgroundColor: 'gray.5',
      sm: { paddingTop: '42px' },
    })}
  >
    <div
      class={css({
        borderBottomWidth: '1px',
        borderBottomColor: 'gray.200',
        marginX: { base: '20px', sm: '40px' },
        marginBottom: '20px',
        paddingBottom: '10px',
      })}
    >
      <input
        class={css({ width: 'full', fontSize: { base: '22px', sm: '28px' }, fontWeight: 'bold' })}
        maxlength="100"
        placeholder="제목을 입력하세요"
        type="text"
        bind:value={$title}
      />

      <input
        class={css({ marginTop: '4px', width: 'full', fontSize: '16px', fontWeight: 'medium' })}
        maxlength="100"
        placeholder="부제목을 입력해주세요"
        type="text"
        bind:value={$subtitle}
      />
    </div>

    <div class={flex({ grow: '1', paddingX: { base: '20px', sm: '40px' }, width: 'full' })}>
      <TiptapEditor
        style={css.raw({ flexGrow: '1', marginBottom: '100px', maxWidth: 'full' })}
        document={$state.document}
        bind:editor={$state.editor}
      />
    </div>

    {#if $state.editor}
      <ArticleLinkEditMenu editor={$state.editor} />
      <ArticleRubyEditMenu editor={$state.editor} />
    {/if}
  </div>
</main>
