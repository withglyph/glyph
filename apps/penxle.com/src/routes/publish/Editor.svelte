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
    <TiptapEditor class="mt-12 max-w-full grow whitespace-pre-wrap" bind:editor bind:content />
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
            class={`rounded-full square-4.5 bg-${
              editor.getAttributes('text-color')?.['data-text-color']?.slice(5) ?? 'gray-90'
            }`}
          />
          <i class="i-lc-chevron-down square-6 text-border-secondary" />
        </svelte:fragment>

        <MenuItem class="flex gap-2.5 items-center" on:click={() => editor?.chain().focus().unsetTextColor().run()}>
          <div class="flex items-center gap-2 body-14-m text-primary">
            <div class="bg-gray-90 rounded-full square-4.5" />
            검정색
          </div>
        </MenuItem>
        <MenuItem
          class="flex gap-2.5 items-center"
          on:click={() => editor?.chain().focus().setTextColor({ 'data-text-color': 'text-gray-50' }).run()}
        >
          <div class="flex items-center gap-2 body-14-m text-gray-50">
            <div class="bg-gray-50 rounded-full square-4.5" />
            회색
          </div>
        </MenuItem>
        <MenuItem
          class="flex gap-2.5 items-center"
          on:click={() => editor?.chain().focus().setTextColor({ 'data-text-color': 'text-gray-30' }).run()}
        >
          <div class="flex items-center gap-2 body-14-m text-gray-30">
            <div class="bg-gray-30 rounded-full square-4.5" />
            회색 2
          </div>
        </MenuItem>
        <MenuItem
          class="flex gap-2.5 items-center"
          on:click={() => editor?.chain().focus().setTextColor({ 'data-text-color': 'text-red-60' }).run()}
        >
          <div class="flex items-center gap-2 body-14-m text-red-60">
            <div class="bg-red-60 rounded-full square-4.5" />
            빨간색
          </div>
        </MenuItem>
        <MenuItem
          class="flex gap-2.5 items-center"
          on:click={() => editor?.chain().focus().setTextColor({ 'data-text-color': 'text-blue-60' }).run()}
        >
          <div class="flex items-center gap-2 body-14-m text-blue-60">
            <div class="bg-blue-60 rounded-full square-4.5" />
            파란색
          </div>
        </MenuItem>
        <MenuItem
          class="flex gap-2.5 items-center"
          on:click={() => editor?.chain().focus().setTextColor({ 'data-text-color': 'text-orange-70' }).run()}
        >
          <div class="flex items-center gap-2 body-14-m text-orange-70">
            <div class="bg-orange-70 rounded-full square-4.5" />
            갈색
          </div>
        </MenuItem>
        <MenuItem
          class="flex gap-2.5 items-center"
          on:click={() => editor?.chain().focus().setTextColor({ 'data-text-color': 'text-green-60' }).run()}
        >
          <div class="flex items-center gap-2 body-14-m text-green-60">
            <div class="bg-green-60 rounded-full square-4.5" />
            초록색
          </div>
        </MenuItem>
        <MenuItem
          class="flex gap-2.5 items-center"
          on:click={() => editor?.chain().focus().setTextColor({ 'data-text-color': 'text-purple-60' }).run()}
        >
          <div class="flex items-center gap-2 body-14-m text-purple-60">
            <div class="bg-purple-60 rounded-full square-4.5" />
            보라색
          </div>
        </MenuItem>
      </Menu>

      <Menu
        class="flex items-center gap-0.25rem body-14-m p-(x-0.5rem y-0.25rem) hover:(bg-primary rounded-lg)"
        offset={menuOffset}
        placement="bottom-start"
      >
        <svelte:fragment slot="value">
          본문 1
          <i class="i-lc-chevron-down square-6 text-border-secondary" />
        </svelte:fragment>

        <MenuItem
          class="flex items-center justify-between gap-2"
          on:click={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <div class="title-24-b text-primary">제목 1</div>
          {#if editor.isActive('heading', { level: 1 })}
            <i class="i-lc-check square-4 text-blue-50" />
          {/if}
        </MenuItem>
        <MenuItem
          class="flex items-center justify-between gap-2"
          on:click={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <div class="title-20-b text-primary">제목 2</div>
          {#if editor.isActive('heading', { level: 2 })}
            <i class="i-lc-check square-4 text-blue-50" />
          {/if}
        </MenuItem>
        <MenuItem
          class="flex items-center justify-between gap-2"
          on:click={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <div class="subtitle-18-b text-primary">제목 3</div>
          {#if editor.isActive('heading', { level: 3 })}
            <i class="i-lc-check square-4 text-blue-50" />
          {/if}
        </MenuItem>
        <MenuItem class="flex items-center justify-between gap-2">
          <div class="text-primary">본문 1</div>
          <!-- {#if editor.isActive('heading', { level: 1 })}
              <i class="i-lc-check square-4 text-blue-50" />
            {/if} -->
        </MenuItem>
        <MenuItem class="flex items-center justify-between gap-2">
          <div class="body-13-m text-primary">본문 2</div>
          <!-- {#if editor.isActive('heading', { level: 1 })}
              <i class="i-lc-check square-4 text-blue-50" />
            {/if} -->
        </MenuItem>
      </Menu>

      <Menu
        class="flex items-center gap-0.25rem body-14-m hover:(bg-primary rounded-lg) h-full"
        offset={menuOffset}
        placement="bottom-start"
      >
        <svelte:fragment slot="value">
          프리텐다드
          <i class="i-lc-chevron-down square-0.75rem text-border-secondary" />
        </svelte:fragment>

        <MenuItem>프리텐다드</MenuItem>
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

      <button class="flex items-center gap-2 body-14-m p-xs hover:(bg-primary rounded-lg)" type="button">
        <i class="i-lc-align-vertical-space-between square-1rem" />
      </button>

      <button class="flex items-center gap-2 body-14-m p-xs hover:(bg-primary rounded-lg)" type="button">
        <i class="i-lc-align-horizontal-space-between square-1rem" />
      </button>
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
        <MenuItem class="flex gap-2.5 items-center">
          <span class="p-1 border border-alphagray-15 rounded-lg flex center">
            <i class="i-lc-image square-5" />
          </span>
          이미지
        </MenuItem>
        <MenuItem class="flex gap-2.5 items-center">
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
