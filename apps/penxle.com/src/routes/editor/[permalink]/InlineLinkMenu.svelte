<script lang="ts">
  import { Editor, posToDOMRect } from '@tiptap/core';
  import { Plugin, PluginKey } from '@tiptap/pm/state';
  import * as R from 'radash';
  import { onMount, tick } from 'svelte';
  import IconCheck from '~icons/tabler/check';
  import IconTrash from '~icons/tabler/trash';
  import { Icon, Tooltip } from '$lib/components';
  import { createFloatingActions } from '$lib/svelte/actions';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { VirtualElement } from '@floating-ui/dom';
  import type { EditorView } from '@tiptap/pm/view';

  const key = 'link-edit-menu';

  export let editor: Editor;
  let href: string | undefined;
  $: trimmedHref = (href ?? '').trim();

  let open = false;
  let preventUpdate = false;

  const { anchor, floating, arrow } = createFloatingActions({
    placement: 'top',
    offset: 8,
    arrow: true,
  });

  const update = R.debounce({ delay: 150 }, async (view: EditorView) => {
    if (preventUpdate) {
      preventUpdate = false;
      return;
    }

    const { from, to } = view.state.selection;

    if (!editor.isActive('link')) {
      open = false;
      return;
    }

    href = editor.getAttributes('link').href;

    open = true;
    await tick();

    const targetEl: VirtualElement = {
      getBoundingClientRect: () => posToDOMRect(view, from, to),
      contextElement: view.dom,
    };

    anchor(targetEl);
  });

  onMount(() => {
    editor.registerPlugin(
      new Plugin({
        key: new PluginKey(key),
        view: () => ({ update }),
      }),
    );

    return () => {
      editor.unregisterPlugin(key);
    };
  });
</script>

{#if open}
  <form
    class={flex({
      position: 'absolute',
      align: 'center',
      gap: '8px',
      paddingX: '12px',
      paddingY: '8px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: 'medium',
      color: 'gray.500',
      backgroundColor: 'white',
      boxShadow: '[0 2px 10px 0 {colors.black/10}]',
      zIndex: '30',
      userSelect: 'none',
    })}
    on:submit|preventDefault={() => {
      const command = editor.chain().focus();
      if (trimmedHref.length > 0) {
        command.updateLink(trimmedHref).run();
      } else {
        command.unsetLink().run();
      }
    }}
    use:floating
  >
    <span
      class={css({
        visibility: 'hidden',
        minWidth: '132px',
        maxWidth: '320px',
        textOverflow: 'clip',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      })}
    >
      {href}
    </span>
    <input
      class={css({ position: 'absolute', left: '12px', width: 'full', maxWidth: '320px' })}
      readonly={editor.isActive('link', { auto: true })}
      size={href?.length}
      type="url"
      on:mousedown|stopPropagation={() => (preventUpdate = true)}
      bind:value={href}
    />
    <Tooltip message={trimmedHref.length > 0 ? '적용' : '링크 삭제'}>
      <button class={css({ color: { base: 'gray.500', _hover: 'gray.900', _active: 'gray.900' } })} type="submit">
        {#if trimmedHref.length > 0}
          <Icon icon={IconCheck} />
        {:else}
          <Icon icon={IconTrash} />
        {/if}
      </button>
    </Tooltip>
    <div class={css({ size: '8px', backgroundColor: 'white' })} use:arrow />
  </form>
{/if}
