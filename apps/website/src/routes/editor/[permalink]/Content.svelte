<script lang="ts">
  import { onMount } from 'svelte';
  import { TiptapEditor } from '$lib/tiptap/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import { getEditorContext } from './context';
  import type { Writable } from 'svelte/store';
  import type * as Y from 'yjs';

  const { state, forceSynchronize } = getEditorContext();

  const createStore = (doc: Y.Doc, name: string) => {
    const yText = doc.getText(name);

    const store: Writable<string> = {
      subscribe: (run) => {
        const handler = () => {
          run(yText.toString());
        };

        yText.observe(handler);
        handler();

        return () => {
          yText.unobserve(handler);
        };
      },
      set: (value: string) => {
        doc.transact(() => {
          yText.delete(0, yText.length);
          yText.insert(0, value);
        });
      },
      update: (fn: (value: string) => string) => {
        doc.transact(() => {
          yText.delete(0, yText.length);
          yText.insert(0, fn(yText.toString()));
        });
      },
    };

    return store;
  };

  const title = createStore($state.document, 'title');
  const subtitle = createStore($state.document, 'subtitle');

  onMount(() => {
    const saveEventHandler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        forceSynchronize();
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
      backgroundColor: 'gray.0',
      sm: { paddingTop: '34px' },
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
        placeholder="부제목을 입력하세요"
        type="text"
        bind:value={$subtitle}
      />
    </div>

    <div class={flex({ grow: '1', paddingX: { base: '20px', sm: '40px' }, width: 'full' })}>
      <TiptapEditor
        style={css.raw({ flexGrow: '1', paddingBottom: '100px', maxWidth: 'full' })}
        awareness={$state.awareness}
        document={$state.document}
        bind:editor={$state.editor}
        on:file={(event) => $state.fileHandler?.('auto', event.detail.files, event.detail.pos)}
      />
    </div>
  </div>
</main>
