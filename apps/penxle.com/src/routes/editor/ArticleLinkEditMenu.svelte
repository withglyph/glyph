<script lang="ts">
  import { arrow, computePosition, flip, offset, shift } from '@floating-ui/dom';
  import { Editor, posToDOMRect } from '@tiptap/core';
  import { Plugin, PluginKey } from '@tiptap/pm/state';
  import { EditorView } from '@tiptap/pm/view';
  import * as R from 'radash';
  import { onMount, tick } from 'svelte';
  import { Tooltip } from '$lib/components';
  import { portal } from '$lib/svelte/actions';

  const key = 'link-edit-menu';

  export let editor: Editor;
  let href: string | undefined;
  $: trimmedHref = (href ?? '').trim();

  let menuEl: HTMLElement;
  let open = false;
  let preventUpdate = false;

  let arrowEl: HTMLDivElement;

  const update = R.debounce({ delay: 150 }, async (view: EditorView) => {
    if (preventUpdate) {
      preventUpdate = false;
      return;
    }

    const { from, to, empty } = view.state.selection;

    if (!editor.isActive('link') || !empty) {
      open = false;
      return;
    }

    href = editor.getAttributes('link').href;

    open = true;
    await tick();

    const targetEl = {
      getBoundingClientRect: () => posToDOMRect(view, from, to),
    };

    const position = await computePosition(targetEl, menuEl, {
      placement: 'top',
      middleware: [offset(8), flip(), shift({ padding: 8 }), arrow({ element: arrowEl })],
    });

    Object.assign(menuEl.style, {
      left: `${position.x}px`,
      top: `${position.y}px`,
    });

    if (position.middlewareData.arrow) {
      const { x, y } = position.middlewareData.arrow;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const staticSide = {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right',
      }[position.placement.split('-')[0]]!;

      Object.assign(arrowEl.style, {
        left: x === undefined ? '' : `${x}px`,
        top: y === undefined ? '' : `${y}px`,
        [staticSide]: '-0.25rem',
      });
    }
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
    bind:this={menuEl}
    class="absolute flex items-center z-25 select-none bg-cardprimary body-13-m text-secondary rounded-lg p-x-xs p-y-2 shadow-[0_2px_10px_0_rgba(0,0,0,0.10)]"
    on:submit|preventDefault={() => {
      const command = editor.chain().focus();
      if (trimmedHref.length > 0) {
        command.updateLink({ href: trimmedHref }).run();
      } else {
        command.unsetLink().run();
      }
    }}
    use:portal
  >
    <input
      style={`width: ${(href ?? '').length * 0.5}rem`}
      class="min-w-8.25rem"
      size={href?.length}
      type="url"
      on:mousedown|stopPropagation={() => (preventUpdate = true)}
      bind:value={href}
    />
    <Tooltip message={trimmedHref.length > 0 ? '적용' : '링크 삭제'}>
      <button class="text-secondary hover:text-primary active:text-primary" type="submit">
        <i
          class={trimmedHref.length > 0 ? 'i-lc-check' : 'i-lc-trash'}
          aria-label={trimmedHref.length > 0 ? '적용' : '링크 삭제'}
        />
      </button>
    </Tooltip>
    <div bind:this={arrowEl} class="absolute square-2 rotate-45 bg-cardprimary" />
  </form>
{/if}
