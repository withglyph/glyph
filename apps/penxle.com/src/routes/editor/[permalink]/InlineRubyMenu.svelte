<script lang="ts">
  import { Editor, posToDOMRect } from '@tiptap/core';
  import { Plugin, PluginKey } from '@tiptap/pm/state';
  import { EditorView } from '@tiptap/pm/view';
  import * as R from 'radash';
  import { onMount, tick } from 'svelte';
  import IconCheck from '~icons/tabler/check';
  import IconTrash from '~icons/tabler/trash';
  import { Icon, Tooltip } from '$lib/components';
  import { createFloatingActions } from '$lib/svelte/actions';
  import type { VirtualElement } from '@floating-ui/dom';

  const key = 'ruby-edit-menu';

  export let editor: Editor;
  let text: string | undefined;
  $: trimmedText = (text ?? '').trim();

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

    if (!editor.isActive('ruby')) {
      open = false;
      return;
    }

    text = editor.getAttributes('ruby').text;

    open = true;
    await tick();

    const targetEl: VirtualElement = {
      getBoundingClientRect: () => posToDOMRect(view, from, to),
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
    class="absolute flex gap-2 items-center z-25 select-none bg-cardprimary body-13-m text-secondary rounded-lg p-x-xs p-y-2 shadow-[0_2px_10px_0_rgba(0,0,0,0.10)]"
    on:submit|preventDefault={() => {
      const command = editor.chain().focus();
      if (trimmedText.length > 0) {
        command.updateRuby(trimmedText).run();
      } else {
        command.unsetRuby().run();
      }
    }}
    use:floating
  >
    <span class="invisible min-w-8.25rem max-w-20rem text-clip overflow-hidden whitespace-nowrap">{text}</span>
    <input
      class="absolute left-xs w-full max-w-20rem"
      type="text"
      on:mousedown|stopPropagation={() => (preventUpdate = true)}
      bind:value={text}
    />
    <Tooltip message={trimmedText.length > 0 ? '적용' : '삭제'}>
      <button class="text-secondary hover:text-primary active:text-primary" type="submit">
        {#if trimmedText.length > 0}
          <Icon icon={IconCheck} />
        {:else}
          <Icon icon={IconTrash} />
        {/if}
      </button>
    </Tooltip>
    <div class="absolute square-2 rotate-45 bg-cardprimary" use:arrow />
  </form>
{/if}
