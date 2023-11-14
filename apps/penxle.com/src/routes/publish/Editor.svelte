<script lang="ts">
  import { computePosition, flip, offset, shift } from '@floating-ui/dom';
  import { writable } from '@svelte-kits/store';
  import { isTextSelection } from '@tiptap/core';
  import clsx from 'clsx';
  import { tick } from 'svelte';
  import { Button } from '$lib/components';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { postKind } from '$lib/stores';
  import { focused, hover } from '$lib/svelte/actions';
  import { TiptapBubbleMenu, TiptapEditor, TiptapFloatingMenu } from '$lib/tiptap/components';
  import { isValidImageFile, validImageMimes } from '$lib/utils';
  import { colors, fonts, getLabelFromCurrentNode, heading, heights, spacing, texts } from './formats';
  import type { Editor, JSONContent } from '@tiptap/core';

  export let title: string;
  export let subtitle: string;
  export let content: JSONContent;
  export let editor: Editor;

  let targetEl: HTMLButtonElement;
  let menuEl: HTMLDivElement;

  let open = false;
  let enableSubtitle = false;

  const focusing = writable(false);
  const hovered = writable(false);

  const update = async () => {
    await tick();

    const position = await computePosition(targetEl, menuEl, {
      placement: 'bottom-end',
      middleware: [offset(4), flip(), shift({ padding: 8 })],
    });

    Object.assign(menuEl.style, {
      left: `${position.x}px`,
      top: `${position.y}px`,
    });
  };

  $: if (open) {
    void update();
  }

  $: if (!menuEl) {
    open = false;
  }

  const menuOffset = 32;

  $: currentNode = editor?.state.selection.$head.parent;
  $: currentTextLabel = `${currentNode?.type.name === heading ? '제목' : '본문'} ${currentNode?.attrs.level ?? 1}`;

  $: label = getLabelFromCurrentNode(currentNode);

  const handleInsertImage = () => {
    const picker = document.createElement('input');
    picker.type = 'file';
    picker.accept = validImageMimes.join(',');

    picker.addEventListener('change', async () => {
      const file = picker.files?.[0];

      if (!file || !(await isValidImageFile(file))) {
        return;
      }

      editor.chain().focus().setImage(file).run();
    });

    picker.showPicker();
  };

  const handleInsertFile = () => {
    const picker = document.createElement('input');
    picker.type = 'file';

    picker.addEventListener('change', async () => {
      const file = picker.files?.[0];

      if (!file) {
        return;
      }

      editor.chain().focus().setFile(file).run();
    });

    picker.showPicker();
  };
</script>

<div class="pt-17" use:hover={hovered}>
  <div class="mx-auto w-full max-w-230">
    <input
      class="py-3 w-full title-32-eb border-b"
      placeholder="제목을 입력하세요"
      type="text"
      bind:value={title}
      use:focused={focusing}
    />

    {#if enableSubtitle}
      <input
        class="mt-4 py-3 w-full subtitle-18-b"
        placeholder="부제목을 입력하세요"
        type="text"
        bind:value={subtitle}
        on:keydown={(e) => {
          if (e.key === 'Backspace' && e.currentTarget.value === '') {
            enableSubtitle = false;
          }
        }}
      />
    {:else}
      <label class="body-16-b flex items-center gap-2 mt-4">
        부제목 추가
        <button
          class="flex center p-0.5 border border-secondary rounded-lg square-6"
          type="button"
          on:click={() => (enableSubtitle = true)}
        >
          <i class="i-lc-plus square-3.5 text-secondary" />
        </button>
      </label>
    {/if}
  </div>
</div>

{#if $postKind === 'ARTICLE'}
  <div class="mx-auto w-full max-w-230 flex grow">
    <TiptapEditor class="my-12 max-w-full grow whitespace-pre-wrap" bind:editor bind:content />
  </div>

  {#if editor}
    <TiptapBubbleMenu
      class="bg-cardprimary px-3 py-1 rounded-lg shadow-[0_4px_16px_0_rgba(0,0,0,0.15)] flex items-center gap-1 h-12"
      {editor}
      when={(view) => isTextSelection(view.state.selection)}
    >
      <Menu
        class="flex items-center gap-0.25rem p-(x-0.5rem y-0.75rem) hover:(bg-primary rounded-lg)"
        offset={menuOffset}
        placement="bottom-start"
      >
        <svelte:fragment slot="value">
          <div
            class={clsx(
              'rounded-full square-4.5',
              editor.getAttributes('text-color')?.['data-text-color'],
              'bg-[currentColor]',
            )}
          />
          <i class="i-lc-chevron-down square-6 text-border-secondary" />
        </svelte:fragment>
        {#each colors as color (color.value)}
          <MenuItem
            class="flex"
            on:click={() => {
              const commands = editor?.chain().focus();

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

      <Menu
        class="flex items-center gap-0.25rem body-14-m p-(x-0.5rem y-0.25rem) hover:(bg-primary rounded-lg)"
        offset={menuOffset}
        placement="bottom-start"
      >
        <svelte:fragment slot="value">
          {currentTextLabel}
          <i class="i-lc-chevron-down square-6 text-border-secondary" />
        </svelte:fragment>
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

      <Menu
        class="flex justify-between items-center gap-0.25rem body-14-m hover:(bg-primary rounded-lg) min-w-6rem h-full"
        offset={menuOffset}
        placement="bottom-start"
      >
        <svelte:fragment slot="value">
          {label.font}
          <i class="i-lc-chevron-down square-6 text-border-secondary" />
        </svelte:fragment>
        {#each fonts as font (font.value)}
          <MenuItem
            class={clsx('flex items-center gap-2 justify-between', `font-${font.value}`)}
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

      <button
        class="flex center p-xs hover:(bg-primary rounded-lg)"
        type="button"
        on:click={() => editor.chain().focus().toggleBold().run()}
      >
        <i class={clsx('i-lc-bold square-1rem', editor.isActive('bold') && 'text-blue-50')} />
      </button>
      <button
        class="flex center p-xs hover:(bg-primary rounded-lg)"
        type="button"
        on:click={() => editor.chain().focus().toggleItalic().run()}
      >
        <i class={clsx('i-lc-italic square-1rem', editor.isActive('italic') && 'text-blue-50')} />
      </button>
      <button
        class="flex center p-xs hover:(bg-primary rounded-lg)"
        type="button"
        on:click={() => editor.chain().focus().toggleStrike().run()}
      >
        <i class={clsx('i-lc-strikethrough square-1rem', editor.isActive('strike') && 'text-blue-50')} />
      </button>
      <button
        class="flex center p-xs hover:(bg-primary rounded-lg)"
        type="button"
        on:click={() => editor.chain().focus().toggleUnderline().run()}
      >
        <i class={clsx('i-lc-underline square-1rem', editor.isActive('underline') && 'text-blue-50')} />
      </button>

      <Menu
        class="hover:(bg-primary rounded-lg) hover:(bg-primary rounded-lg)"
        offset={menuOffset}
        placement="bottom-start"
      >
        <div slot="value" class="flex items-center gap-0.25rem body-14-m p-xs">
          <i class="i-lc-align-left square-1rem" />
        </div>

        <div class="flex w-full rounded-lg">
          <button
            class="flex center hover:(bg-primary text-primary)"
            type="button"
            on:click={() => editor.chain().focus().setTextAlign('left').run()}
          >
            <i
              class={clsx('i-lc-align-left square-1rem', editor.isActive({ 'text-align': 'left' }) && 'text-blue-50')}
            />
          </button>
          <button
            class="flex center hover:(bg-primary text-primary)"
            type="button"
            on:click={() => editor.chain().focus().setTextAlign('center').run()}
          >
            <i
              class={clsx(
                'i-lc-align-center square-1rem',
                editor.isActive({ 'text-align': 'center' }) && 'text-blue-50',
              )}
            />
          </button>
          <button
            class="flex center hover:(bg-primary text-primary)"
            type="button"
            on:click={() => editor.chain().focus().setTextAlign('right').run()}
          >
            <i
              class={clsx('i-lc-align-right square-1rem', editor.isActive({ 'text-align': 'right' }) && 'text-blue-50')}
            />
          </button>
          <button
            class="flex center hover:(bg-primary text-primary)"
            type="button"
            on:click={() => editor.chain().focus().setTextAlign('justify').run()}
          >
            <i
              class={clsx(
                'i-lc-align-justify square-1rem',
                editor.isActive({ 'text-align': 'justify' }) && 'text-blue-50',
              )}
            />
          </button>
        </div>
      </Menu>

      <button class="flex items-center gap-2 body-14-m p-xs hover:(bg-primary rounded-lg)" type="button">
        <i class="i-lc-link-2 square-1rem" />
      </button>

      <Menu
        class="flex items-center p-xs hover:(bg-primary rounded-lg) h-full"
        offset={menuOffset}
        placement="bottom-start"
      >
        <svelte:fragment slot="value">
          <i class="i-lc-align-vertical-space-between square-1rem" />
        </svelte:fragment>
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

      <Menu
        class="flex items-center p-xs hover:(bg-primary rounded-lg) h-full"
        offset={menuOffset}
        placement="bottom-start"
      >
        <svelte:fragment slot="value">
          <i class="i-lc-align-horizontal-space-between square-1rem" />
        </svelte:fragment>
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
    </TiptapBubbleMenu>

    <TiptapFloatingMenu {editor}>
      <Menu offset={16} placement="left-start">
        <Button slot="value" class="rounded-full! p-2! bg-white" color="tertiary" size="lg" variant="outlined">
          <i class="i-lc-plus square-5" />
        </Button>

        <MenuItem class="flex gap-2.5 items-center" on:click={() => editor.chain().focus().setAccessBarrier().run()}>
          <span class="p-1 border border-alphagray-15 rounded-lg flex center">
            <i class="i-lc-circle-dollar-sign square-5" />
          </span>
          결제선 추가
        </MenuItem>
        <MenuItem class="flex gap-2.5 items-center">
          <span class="p-1 border border-alphagray-15 rounded-lg flex center">
            <i class="i-lc-minus square-5" />
          </span>
          구분선 추가
        </MenuItem>
        <MenuItem class="flex gap-2.5 items-center">
          <span class="p-1 border border-alphagray-15 rounded-lg flex center">
            <i class="i-lc-quote square-5" />
          </span>
          인용구 추가
        </MenuItem>
        <MenuItem class="flex gap-2.5 items-center">
          <span class="p-1 border border-alphagray-15 rounded-lg flex center">
            <i class="i-lc-list square-5" />
          </span>
          리스트 추가
        </MenuItem>
        <MenuItem class="flex gap-2.5 items-center" on:click={handleInsertImage}>
          <span class="p-1 border border-alphagray-15 rounded-lg flex center">
            <i class="i-lc-image square-5" />
          </span>
          이미지 업로드
        </MenuItem>
        <MenuItem class="flex gap-2.5 items-center" on:click={handleInsertFile}>
          <span class="p-1 border border-alphagray-15 rounded-lg flex center">
            <i class="i-lc-paperclip square-5" />
          </span>
          파일 업로드
        </MenuItem>
      </Menu>
    </TiptapFloatingMenu>
  {/if}
{:else}
  <div class="mx-auto w-full max-w-230 grow bg-primary" />
{/if}
