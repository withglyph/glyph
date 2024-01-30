<script lang="ts">
  import { isTextSelection } from '@tiptap/core';
  import clsx from 'clsx';
  import { tick } from 'svelte';
  import { Tooltip } from '$lib/components';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { TiptapBubbleMenu } from '$lib/tiptap/components';
  import { values } from '$lib/tiptap/values';
  import type { Editor } from '@tiptap/core';

  export let editor: Editor;

  let linkInputEl: HTMLInputElement | null = null;

  let href = '';
  let linkButtonOpen = false;

  $: if (linkButtonOpen) {
    href = '';

    // eslint-disable-next-line unicorn/prefer-top-level-await
    void tick().then(() => {
      linkInputEl?.focus();
    });
  }

  const offset = 32;
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
          style:color={editor.getAttributes('font_color').fontColor ?? values.color[0].value}
          class={clsx('rounded-full square-4.5', 'bg-[currentColor]')}
        />
        <i class="i-lc-chevron-down square-6 text-border-secondary" />
      </div>

      {#each values.color as color (color.value)}
        <MenuItem
          class="flex"
          on:click={() => {
            if (color.value === values.color[0].value) {
              editor.chain().focus().unsetFontColor().run();
            } else {
              editor.chain().focus().setFontColor(color.value).run();
            }
          }}
        >
          <div style:color={color.value} class={clsx('inline-flex items-center body-14-m')}>
            <i class="bg-[currentColor] rounded-full square-4.5 m-r-0.5rem" />
            {color.label}
          </div>
        </MenuItem>
      {/each}
    </Menu>
  </Tooltip>

  <Tooltip message="글자 크기" placement="top">
    <Menu class="flex items-center p-xs hover:(bg-primary rounded-lg)" {offset} placement="bottom-start">
      <i slot="value" class="i-lc-a-large-small square-1rem" />

      {#each values.fontSize as fontSize (fontSize.value)}
        <MenuItem
          class="flex items-center gap-2 justify-between"
          on:click={() => {
            if (fontSize.value === 16) {
              editor.chain().focus().unsetFontSize().run();
            } else {
              editor.chain().focus().setFontSize(fontSize.value).run();
            }
          }}
        >
          {fontSize.label}
          <i
            class={clsx(
              'i-lc-check square-4 text-blue-50',
              !editor.isActive({ fontSize: fontSize.value }) && 'invisible',
            )}
            aria-hidden={!editor.isActive({ fontSize: fontSize.value })}
            aria-label="선택됨"
          />
        </MenuItem>
      {/each}
    </Menu>
  </Tooltip>

  <Tooltip class="flex center px-1 h-full hover:(bg-primary rounded-lg)" message="폰트" placement="top">
    <Menu class={clsx('body-14-m')} {offset} placement="bottom-start">
      <div slot="value" class="flex center gap-1">
        {values.fontFamily.find(({ value }) => editor.getAttributes('font_family').fontFamily === value)?.label ??
          values.fontFamily[0].label}
        <i class="i-lc-chevron-down square-6 text-border-secondary" />
      </div>

      {#each values.fontFamily as font (font.value)}
        <MenuItem
          class={clsx('flex items-center gap-2 justify-between')}
          on:click={() => {
            if (font.value === values.fontFamily[0].value) {
              editor.chain().focus().unsetFontFamily().run();
            } else {
              editor.chain().focus().setFontFamily(font.value).run();
            }
          }}
        >
          <span style:font-family={`PNXL_${font.value}`}>
            {font.label}
          </span>
          <i
            class={clsx(
              'i-lc-check square-4 text-blue-50',
              !editor.isActive({ fontFamily: font.value }) && 'invisible',
            )}
            aria-hidden={!editor.isActive({ fontFamily: font.value })}
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
      <i
        slot="value"
        class={clsx(
          values.textAlign.find(({ value }) => value === editor.getAttributes('paragraph').textAlign)?.icon ??
            values.textAlign[0].icon,
          'square-1rem',
        )}
      />

      {#each values.textAlign as textAlign (textAlign.value)}
        <button
          class="flex center m-none! p-xs hover:(bg-primary) aria-pressed:text-blue-50"
          aria-pressed={editor.isActive({ textAlign: textAlign.value })}
          type="button"
          on:click={() => editor.chain().focus().setParagraphTextAlign(textAlign.value).run()}
        >
          <i class={clsx(textAlign.icon, 'square-1rem')} />
        </button>
      {/each}
    </Menu>
  </Tooltip>

  <Tooltip message="링크" placement="top">
    <Menu
      class="flex items-center gap-2 body-14-m p-xs hover:(bg-primary rounded-lg)"
      disabled={editor.isActive('link')}
      {offset}
      padding={false}
      bind:open={linkButtonOpen}
    >
      <i slot="value" class="i-lc-link-2 square-1rem" />
      <MenuItem type="div">
        <form
          class="flex relative gap-2 body-13-m text-secondary"
          on:submit|preventDefault={(event) => {
            if (!(event.currentTarget.url instanceof HTMLInputElement)) throw new Error('Fail to access input element');

            const href = event.currentTarget.url.value;
            editor.chain().focus().setLink(href).run();
            // 메뉴 닫기
            event.currentTarget.click();
          }}
        >
          <span class="invisible flex-grow min-w-8.25rem max-w-20rem text-clip overflow-hidden whitespace-nowrap">
            {href}
          </span>
          <input
            bind:this={linkInputEl}
            name="url"
            class="absolute w-full max-w-20rem"
            autocomplete="on"
            placeholder="예) https://penxle.com"
            required
            type="url"
            on:click|stopPropagation
            on:input={(event) => {
              href = event.currentTarget.value;
            }}
          />
          <Tooltip message="적용하기">
            <button class="hover:text-primary active:text-primary" type="submit" on:click|stopPropagation>
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

      {#each values.lineHeight as lineHeight (lineHeight.value)}
        <MenuItem
          class="flex items-center gap-2 justify-between"
          on:click={() => {
            editor.chain().focus().setParagraphLineHeight(lineHeight.value).run();
          }}
        >
          {lineHeight.label}
          <i
            class={clsx(
              'i-lc-check square-4 text-blue-50',
              !editor.isActive({ lineHeight: lineHeight.value }) && 'invisible',
            )}
            aria-hidden={!editor.isActive({ lineHeight: lineHeight.value })}
            aria-label="선택됨"
          />
        </MenuItem>
      {/each}
    </Menu>
  </Tooltip>

  <Tooltip message="자간" placement="top">
    <Menu class="flex items-center p-xs body-14-m hover:(bg-primary rounded-lg)" {offset} placement="bottom-start">
      <i slot="value" class="i-lc-unfold-horizontal square-1rem" />

      {#each values.letterSpacing as letterSpacing (letterSpacing.value)}
        <MenuItem
          class="flex items-center gap-2 justify-between"
          on:click={() => {
            editor.chain().focus().setParagraphLetterSpacing(letterSpacing.value).run();
          }}
        >
          {letterSpacing.label}
          <i
            class={clsx(
              'i-lc-check square-4 text-blue-50',
              !editor.isActive({ letterSpacing: letterSpacing.value }) && 'invisible',
            )}
            aria-hidden={!editor.isActive({ letterSpacing: letterSpacing.value })}
            aria-label="선택됨"
          />
        </MenuItem>
      {/each}
    </Menu>
  </Tooltip>
</TiptapBubbleMenu>
