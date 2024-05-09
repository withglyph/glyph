<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import IconX from '~icons/tabler/x';
  import { Icon } from '$lib/components';
  import { Button } from '$lib/components/v2';
  import { TextInput } from '$lib/components/v2/forms';
  import { scrollLock } from '$lib/svelte/actions';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import { getEditorContext } from './context';

  const { state } = getEditorContext();
  $: editor = $state.editor;

  let close = getContext<undefined | (() => void)>('close');
  let value = '';

  onMount(() => {
    if (editor?.isActive('link')) {
      value = editor.getAttributes('link').href;
    }
  });
</script>

<div
  class={css({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
    width: 'full',
    maxHeight: { base: '540px', sm: '600px' },
    maxWidth: { sm: '420px' },
    backgroundColor: 'gray.5',
    pointerEvents: 'auto',
    userSelect: 'text',
  })}
  use:scrollLock
>
  <header
    class={css({
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      borderBottomWidth: '1px',
      borderBottomColor: 'gray.150',
      paddingX: '20px',
      paddingY: '15px',
    })}
  >
    <h3
      class={css({
        display: 'flex',
        justifyContent: 'center',
        flex: '1',
        marginX: '32px',
        fontSize: '18px',
        fontWeight: 'semibold',
        wordBreak: 'keep-all',
      })}
    >
      링크
    </h3>

    <button class={css({ position: 'absolute', right: '0', paddingX: '20px' })} type="button" on:click={close}>
      <Icon icon={IconX} size={24} />
    </button>
  </header>

  <div
    class={css({
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      flexGrow: '1',
      width: 'full',
      overflowY: 'auto',
    })}
    data-scroll-lock-ignore
  >
    <div
      class={css({
        paddingTop: '16px',
        paddingX: '20px',
        paddingBottom: { base: '52px', sm: '32px' },
        overflowY: 'auto',
      })}
    >
      <TextInput size="sm" type="text" bind:value />
    </div>

    <div class={flex({ justify: 'space-between' })}>
      <Button
        on:click={() => {
          editor?.chain().focus().unsetLink().run();

          if (close) {
            close();
          }
        }}
      >
        링크제거
      </Button>
      <Button
        on:click={() => {
          if (editor?.state.selection.empty && !editor?.isActive('link')) {
            const positionStart = editor?.state.selection.$from.pos;
            editor?.chain().focus().insertContent(value).run();
            const positionEnd = editor?.state.selection.$from.pos;

            editor
              ?.chain()
              .focus()
              .setTextSelection({ from: positionStart, to: positionEnd })
              .setLink(value)
              .setTextSelection(editor?.state.selection.$to.pos)
              .insertContent(' ')
              .run();
          } else {
            if (editor?.isActive('link')) {
              alert(value);
              editor?.chain().focus().updateLink(value).run();
            } else {
              editor?.chain().focus().setLink(value).run();
            }
          }

          if (close) {
            close();
          }
        }}
      >
        삽입
      </Button>
    </div>
  </div>
</div>
