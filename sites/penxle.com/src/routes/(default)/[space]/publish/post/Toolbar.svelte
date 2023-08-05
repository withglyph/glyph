<script lang="ts">
  import ToolbarButton from './ToolbarButton.svelte';
  import type { Editor } from '@tiptap/core';

  export let editor: Editor | undefined;
</script>

<div class="sticky bottom-0 z-50 bg-white py-4">
  <div class="mx-auto w-4xl flex items-center">
    <div class="flex grow items-center gap-2">
      <ToolbarButton
        name="굵게"
        class="i-lc-bold"
        active={editor?.isActive('bold')}
        on:click={() => editor?.chain().focus().toggleBold().run()}
      />

      <ToolbarButton
        name="기울임"
        class="i-lc-italic"
        active={editor?.isActive('italic')}
        on:click={() => editor?.chain().focus().toggleItalic().run()}
      />

      <ToolbarButton
        name="취소선"
        class="i-lc-strikethrough"
        active={editor?.isActive('strike')}
        on:click={() => editor?.chain().focus().toggleStrike().run()}
      />

      <ToolbarButton
        name="밑줄"
        class="i-lc-underline"
        active={editor?.isActive('underline')}
        on:click={() => editor?.chain().focus().toggleUnderline().run()}
      />

      <span class="square-6" />

      <ToolbarButton
        name="제목 1"
        class="i-lc-heading-1"
        active={editor?.isActive('heading', { level: 1 })}
        on:click={() =>
          editor?.chain().focus().toggleHeading({ level: 1 }).run()}
      />

      <ToolbarButton
        name="제목 2"
        class="i-lc-heading-2"
        active={editor?.isActive('heading', { level: 2 })}
        on:click={() =>
          editor?.chain().focus().toggleHeading({ level: 2 }).run()}
      />

      <ToolbarButton
        name="제목 3"
        class="i-lc-heading-3"
        active={editor?.isActive('heading', { level: 3 })}
        on:click={() =>
          editor?.chain().focus().toggleHeading({ level: 3 }).run()}
      />

      <span class="square-6" />

      <ToolbarButton
        name="왼쪽 정렬"
        class="i-lc-align-left"
        active={editor?.isActive({ textAlign: 'left' })}
        on:click={() => editor?.chain().focus().setTextAlign('left').run()}
      />

      <ToolbarButton
        name="중앙 정렬"
        class="i-lc-align-center"
        active={editor?.isActive({ textAlign: 'center' })}
        on:click={() => editor?.chain().focus().setTextAlign('center').run()}
      />

      <ToolbarButton
        name="오른쪽 정렬"
        class="i-lc-align-right"
        active={editor?.isActive({ textAlign: 'right' })}
        on:click={() => editor?.chain().focus().setTextAlign('right').run()}
      />

      <ToolbarButton
        name="양쪽 정렬"
        class="i-lc-align-justify"
        active={editor?.isActive({ textAlign: 'justify' })}
        on:click={() => editor?.chain().focus().setTextAlign('justify').run()}
      />
    </div>

    <div class="flex items-center gap-2">
      <ToolbarButton
        name="실행 취소"
        class="i-lc-rotate-ccw square-5!"
        on:click={() => editor?.chain().focus().undo().run()}
      />
      <ToolbarButton
        name="다시 실행"
        class="i-lc-rotate-cw square-5!"
        on:click={() => editor?.chain().focus().redo().run()}
      />
    </div>
  </div>
</div>
