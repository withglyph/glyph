<script lang="ts">
  import { onMount } from 'svelte';
  import { TiptapEditor } from '$lib/tiptap/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import { getEditorContext } from './context';
  import ArticleLinkEditMenu from './InlineLinkMenu.svelte';
  import ArticleRubyEditMenu from './InlineRubyMenu.svelte';

  const { store, state } = getEditorContext();

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
      maxWidth: '1062px',
      backgroundColor: 'gray.5',
      sm: { paddingTop: '42px' },
    })}
  >
    <div
      class={css({
        borderBottomWidth: '1px',
        borderBottomColor: 'gray.200',
        marginX: { base: '20px', sm: '80px' },
        marginBottom: '20px',
        paddingBottom: '20px',
      })}
    >
      <input
        class={css({ width: 'full', fontSize: { base: '22px', sm: '28px' }, fontWeight: 'medium' })}
        maxlength="100"
        placeholder="제목을 입력하세요"
        type="text"
        bind:value={$store.title}
      />

      <input
        class={css({ marginTop: '4px', width: 'full', fontSize: '16px' })}
        maxlength="100"
        placeholder="부제목을 입력해주세요"
        type="text"
        bind:value={$store.subtitle}
      />
    </div>

    <div class={flex({ grow: '1', paddingX: { base: '20px', sm: '80px' }, width: 'full' })}>
      <TiptapEditor
        style={css.raw({ flexGrow: '1', marginBottom: '100px', maxWidth: 'full' })}
        options={$store}
        bind:editor={$state.editor}
        bind:content={$store.content}
      />
    </div>

    {#if $state.editor}
      <ArticleLinkEditMenu editor={$state.editor} />
      <ArticleRubyEditMenu editor={$state.editor} />
    {/if}
  </div>
</main>
