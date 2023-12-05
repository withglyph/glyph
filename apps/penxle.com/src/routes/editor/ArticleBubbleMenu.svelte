<script lang="ts">
  import { isTextSelection } from '@tiptap/core';
  import clsx from 'clsx';
  import { Tooltip } from '$lib/components';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { TiptapBubbleMenu } from '$lib/tiptap/components';
  import { alignments, colors, fonts, getToggledFormat, heading, heights, spacing, texts } from './formats.svelte';
  import type { Editor } from '@tiptap/core';

  export let editor: Editor;

  const offset = 32;

  $: currentNode = editor.state.selection.$head.parent;
  $: toggledFormat = getToggledFormat(currentNode);
</script>

<TiptapBubbleMenu
  class="bg-cardprimary px-3 py-1 rounded-lg shadow-[0_4px_16px_0_rgba(0,0,0,0.15)] flex items-center gap-1 h-12"
  {editor}
  when={(view) => isTextSelection(view.state.selection)}
>
  <Tooltip class="flex center px-1 h-full hover:(bg-primary rounded-lg)" message="글씨 색" placement="top">
    <Menu {offset} placement="bottom-start">
      <div slot="value" class="flex items-center gap-0.25rem">
        <div
          class={clsx(
            'rounded-full square-4.5',
            editor.getAttributes('text-color')?.['data-text-color'],
            'bg-[currentColor]',
          )}
        />
        <i class="i-lc-chevron-down square-6 text-border-secondary" />
      </div>

      {#each colors as color (color.value)}
        <MenuItem
          class="flex"
          on:click={() => {
            const commands = editor.chain().focus();

            if (color.value) {
              commands.setTextColor({ 'data-text-color': color.value }).run();
            } else {
              commands.unsetTextColor().run();
            }
          }}
        >
          <div class={clsx('inline-flex items-center body-14-m', color.value ?? 'text-primary')}>
            <i class="bg-[currentColor] rounded-full square-4.5 m-r-0.5rem" />
            {color.label}
          </div>
        </MenuItem>
      {/each}
    </Menu>
  </Tooltip>

  <Tooltip class="flex center px-1 h-full hover:(bg-primary rounded-lg)" message="문단" placement="top">
    <Menu {offset} placement="bottom-start">
      <div slot="value" class="flex center body-14-m gap-1">
        {toggledFormat.text.label}
        <i class="i-lc-chevron-down square-6 text-border-secondary" />
      </div>

      {#each texts as text (`${text.name}-${text.level}}`)}
        <MenuItem
          class="flex items-center gap-2"
          on:click={() => {
            const commands = editor.chain().focus();
            if (text.name === heading) {
              commands.setHeading(text.level).run();
            } else {
              commands.setParagraph(text.level).run();
            }
          }}
        >
          <div class={clsx(text.class, 'text-primary')}>{text.label}</div>
          {#if editor.isActive(text.name, { level: text.level })}
            <i class="i-lc-check square-4 text-blue-50" />
          {/if}
        </MenuItem>
      {/each}
    </Menu>
  </Tooltip>

  <Tooltip class="flex center px-1 h-full hover:(bg-primary rounded-lg)" message="폰트" placement="top">
    <Menu class={clsx('body-14-m', toggledFormat.font.class)} {offset} placement="bottom-start">
      <div slot="value" class="flex center gap-1">
        {toggledFormat.font.label}
        <i class="i-lc-chevron-down square-6 text-border-secondary" />
      </div>

      {#each fonts as font (font.value)}
        <MenuItem
          class={clsx('flex items-center gap-2 justify-between', font.class)}
          on:click={() => {
            editor.chain().focus().setFontFamily(font.value).run();
          }}
        >
          {font.label}
          <i
            class={clsx(
              'i-lc-check square-4 text-blue-50',
              !editor.isActive({ 'font-family': font.value }) && 'invisible',
            )}
            aria-hidden={!editor.isActive({ 'font-family': font.value })}
            aria-label="선택됨"
          />
        </MenuItem>
      {/each}
    </Menu>
  </Tooltip>

  <Tooltip message="굵게" placement="top">
    <button
      class="flex center p-xs hover:(bg-primary rounded-lg)"
      type="button"
      on:click={() => editor.chain().focus().toggleBold().run()}
    >
      <i class={clsx('i-lc-bold square-1rem', editor.isActive('bold') && 'text-blue-50')} />
    </button>
  </Tooltip>

  <Tooltip message="기울임" placement="top">
    <button
      class="flex center p-xs hover:(bg-primary rounded-lg)"
      type="button"
      on:click={() => editor.chain().focus().toggleItalic().run()}
    >
      <i class={clsx('i-lc-italic square-1rem', editor.isActive('italic') && 'text-blue-50')} />
    </button>
  </Tooltip>

  <Tooltip message="취소선" placement="top">
    <button
      class="flex center p-xs hover:(bg-primary rounded-lg)"
      type="button"
      on:click={() => editor.chain().focus().toggleStrike().run()}
    >
      <i class={clsx('i-lc-strikethrough square-1rem', editor.isActive('strike') && 'text-blue-50')} />
    </button>
  </Tooltip>

  <Tooltip message="밑줄" placement="top">
    <button
      class="flex center p-xs hover:(bg-primary rounded-lg)"
      type="button"
      on:click={() => editor.chain().focus().toggleUnderline().run()}
    >
      <i class={clsx('i-lc-underline square-1rem', editor.isActive('underline') && 'text-blue-50')} />
    </button>
  </Tooltip>

  <Tooltip message="정렬" placement="top">
    <Menu
      class="flex items-center gap-0.25rem p-xs hover:(bg-primary rounded-lg) hover:(bg-primary rounded-lg)"
      alignment="horizontal"
      {offset}
      placement="bottom-start"
    >
      <i slot="value" class={clsx(toggledFormat.alignment.class, 'square-1rem')} />

      {#each alignments as alignment (alignment.value)}
        <button
          class="flex center m-none! p-xs hover:(bg-primary) aria-pressed:text-blue-50"
          aria-pressed={editor.isActive({ 'text-align': alignment.value })}
          type="button"
          on:click={() => editor.chain().focus().setTextAlign(alignment.value).run()}
        >
          <i class={clsx(alignment.class, 'square-1rem')} />
        </button>
      {/each}
    </Menu>
  </Tooltip>

  <Tooltip message="링크" placement="top">
    <Menu class="flex items-center gap-2 body-14-m p-xs hover:(bg-primary rounded-lg)" {offset} padding={false}>
      <i slot="value" class="i-lc-link-2 square-1rem" />
      <MenuItem type="div">
        <form
          class="flex"
          on:submit|preventDefault={(event) => {
            if (!event.target) throw new Error('event.target is null');
            if (!(event.target instanceof HTMLFormElement))
              throw new Error('Fail to access event.target as HTMLFromElement');
            if (!('url' in event.target && event.target.url instanceof HTMLInputElement))
              throw new Error('Fail to access input element');

            const href = event.target.url.value;
            editor.chain().focus().setLink({ href }).run();
            // 메뉴 닫기
            event.target.click();
          }}
        >
          <input
            name="url"
            class="flex-grow body-13-m text-secondary"
            autocomplete="on"
            placeholder="예) https://penxle.com"
            required
            type="url"
            on:click|stopPropagation
          />
          <Tooltip message="적용하기">
            <button
              class="text-secondary hover:text-primary active:text-primary"
              type="submit"
              on:click|stopPropagation
            >
              <i class="i-lc-check" />
            </button>
          </Tooltip>
        </form>
      </MenuItem>
    </Menu>
  </Tooltip>

  <Tooltip message="행간" placement="top">
    <Menu class="flex items-center p-xs hover:(bg-primary rounded-lg)" {offset} placement="bottom-start">
      <i slot="value" class="i-lc-unfold-vertical square-1rem" />

      {#each heights as height (height.value)}
        <MenuItem
          class="flex items-center gap-2 justify-between"
          on:click={() => {
            editor.chain().focus().setLineHeight(height.value).run();
          }}
        >
          {height.label}
          <i
            class={clsx(
              'i-lc-check square-4 text-blue-50',
              !editor.isActive({ 'line-height': height.value }) && 'invisible',
            )}
            aria-hidden={!editor.isActive({ 'line-height': height.value })}
            aria-label="선택됨"
          />
        </MenuItem>
      {/each}
    </Menu>
  </Tooltip>

  <Tooltip message="자간" placement="top">
    <Menu class="flex items-center p-xs body-14-m hover:(bg-primary rounded-lg)" {offset} placement="bottom-start">
      <i slot="value" class="i-lc-unfold-horizontal square-1rem" />

      {#each spacing as space (space.value)}
        <MenuItem
          class="flex items-center gap-2 justify-between"
          on:click={() => {
            editor.chain().focus().setLetterSpacing(space.value).run();
          }}
        >
          {space.label}
          <i
            class={clsx(
              'i-lc-check square-4 text-blue-50',
              !editor.isActive({ 'letter-spacing': space.value }) && 'invisible',
            )}
            aria-hidden={!editor.isActive({ 'letter-spacing': space.value })}
            aria-label="선택됨"
          />
        </MenuItem>
      {/each}
    </Menu>
  </Tooltip>
</TiptapBubbleMenu>
