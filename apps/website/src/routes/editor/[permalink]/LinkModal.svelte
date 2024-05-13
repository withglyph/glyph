<script lang="ts">
  import { onMount } from 'svelte';
  import IconLink from '~icons/tabler/link';
  import IconTrash from '~icons/tabler/trash';
  import IconX from '~icons/tabler/x';
  import { Icon } from '$lib/components';
  import { Button } from '$lib/components/v2';
  import { TextInput } from '$lib/components/v2/forms';
  import { portal, scrollLock } from '$lib/svelte/actions';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import { getEditorContext } from './context';

  const { state } = getEditorContext();
  $: editor = $state.editor;

  export let open = false;

  let inputEl: HTMLInputElement;

  let value = '';

  onMount(() => {
    if (editor?.isActive('link')) {
      value = editor.getAttributes('link').href;
    }
  });

  $: if (open) {
    inputEl?.focus();
  }
</script>

{#if open}
  <div
    class={css({
      position: 'fixed',
      inset: '0',
      zIndex: '1',
      smDown: {
        backgroundColor: 'gray.900/50',
        transition: 'opacity',
        backdropFilter: 'auto',
        backdropBlur: '8px',
        zIndex: '10',
      },
    })}
    role="button"
    tabindex="-1"
    on:click={() => (open = false)}
    on:keypress={null}
    use:portal
  />

  <div
    class={css({
      borderColor: 'gray.600',
      backgroundColor: 'gray.0',
      pointerEvents: 'auto',
      userSelect: 'text',
      zIndex: '50',
      sm: {
        position: 'relative',
        borderWidth: '1px',
        width: '363px',
        padding: '14px',
      },
      smDown: {
        position: 'fixed',
        bottom: '0',
        left: '0',
        borderTopWidth: '1px',
        paddingTop: '36px',
        paddingX: '20px',
        paddingBottom: '20px',
        width: 'full',
      },
    })}
    use:scrollLock
  >
    <header
      class={css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      })}
    >
      <p class={css({ fontSize: '14px' })}>링크</p>

      <button
        class={css({ position: 'absolute', top: { base: '16px', sm: '12px' }, right: { base: '20px', sm: '14px' } })}
        type="button"
        on:click={() => (open = false)}
      >
        <Icon icon={IconX} size={24} />
      </button>
    </header>

    <form
      on:submit={() => {
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
            editor?.chain().focus().updateLink(value).run();
          } else {
            editor?.chain().focus().setLink(value).run();
          }
        }

        open = false;
      }}
    >
      <TextInput
        style={css.raw({ marginTop: '12px', marginBottom: '26px' })}
        size="md"
        type="text"
        bind:value
        bind:inputEl
      >
        <Icon slot="left-icon" style={css.raw({ color: 'gray.400' })} icon={IconLink} />
      </TextInput>

      <div
        class={flex({
          align: 'center',
          justify: 'space-between',
          smDown: { flexDirection: 'column', alignItems: 'flex-start', gap: '36px', marginTop: '4px' },
        })}
      >
        <button
          class={flex({
            align: 'center',
            gap: '4px',
            paddingY: '9px',
            paddingLeft: '10px',
            paddingRight: '12px',
            fontSize: '13px',
            fontWeight: 'medium',
            color: 'gray.600',
          })}
          type="button"
          on:click={() => {
            editor?.chain().focus().unsetLink().run();
            open = false;
          }}
        >
          <Icon icon={IconTrash} />
          링크제거
        </button>
        <Button style={css.raw({ width: 'full', hideFrom: 'sm' })} size="md" type="submit" variant="brand-fill">
          삽입
        </Button>
        <Button style={css.raw({ width: '68px', hideBelow: 'sm' })} size="sm" type="submit" variant="brand-fill">
          삽입
        </Button>
      </div>
    </form>
  </div>
{/if}
