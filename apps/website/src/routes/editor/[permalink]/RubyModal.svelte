<script lang="ts">
  import { onMount } from 'svelte';
  import IconRuby from '~icons/glyph/ruby';
  import IconTrash from '~icons/tabler/trash';
  import IconX from '~icons/tabler/x';
  import { Button, Icon } from '$lib/components';
  import { TextInput } from '$lib/components/forms';
  import { scrollLock } from '$lib/svelte/actions';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import { getEditorContext } from './context';

  const { state } = getEditorContext();
  $: editor = $state.editor;

  export let open = false;

  let inputEl: HTMLInputElement;

  let value = '';

  onMount(() => {
    if (editor?.isActive('ruby')) {
      value = editor.getAttributes('ruby').text;
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
      <p class={css({ fontSize: '14px' })}>루비</p>

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
        if (editor?.isActive('ruby')) {
          editor?.chain().focus().updateRuby(value).run();
        } else {
          editor?.chain().focus().setRuby(value).run();
        }
        open = false;
      }}
    >
      <TextInput style={css.raw({ marginTop: '12px', marginBottom: '26px' })} type="text" bind:value bind:inputEl>
        <Icon slot="left-icon" style={css.raw({ color: 'gray.400' })} icon={IconRuby} />
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
            editor?.chain().focus().unsetRuby().run();

            open = false;
          }}
        >
          <Icon icon={IconTrash} />
          루비제거
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
