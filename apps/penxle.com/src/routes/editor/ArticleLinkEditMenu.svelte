<script lang="ts">
  import { flip, offset, shift } from '@floating-ui/dom';
  import { Editor, posToDOMRect } from '@tiptap/core';
  import { Plugin, PluginKey } from '@tiptap/pm/state';
  import { EditorView } from '@tiptap/pm/view';
  import * as R from 'radash';
  import { onMount, tick } from 'svelte';
  import { writable } from 'svelte/store';
  import { Tooltip } from '$lib/components';
  import { portal } from '$lib/svelte/actions';
  import { arrow, computeArrowPosition, createFloatingActions } from '$lib/svelte-floating-ui';
  import type { VirtualElement } from '@floating-ui/dom';

  const key = 'link-edit-menu';

  export let editor: Editor;
  let href: string | undefined;
  $: trimmedHref = (href ?? '').trim();

  let open = false;
  let preventUpdate = false;

  const arrowRef = writable<HTMLElement | null>(null);

  const [floatingRef, floatingContent] = createFloatingActions({
    strategy: 'absolute',
    placement: 'top',
    middleware: [offset(8), flip(), shift({ padding: 8 }), arrow({ element: arrowRef })],
    onComputed(position) {
      if ($arrowRef) {
        Object.assign($arrowRef.style, computeArrowPosition(position));
      }
    },
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
    };

    floatingRef(targetEl);
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
      if (trimmedHref.length > 0) {
        command.updateLink(trimmedHref).run();
      } else {
        command.unsetLink().run();
      }
    }}
    use:floatingContent
    use:portal
  >
    <span class="invisible min-w-8.25rem max-w-20rem text-clip overflow-hidden whitespace-nowrap">{href}</span>
    <input
      class="absolute left-xs w-full max-w-20rem"
      readonly={editor.isActive('link', { auto: true })}
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
    <div bind:this={$arrowRef} class="absolute square-2 rotate-45 bg-cardprimary" />
  </form>
{/if}
