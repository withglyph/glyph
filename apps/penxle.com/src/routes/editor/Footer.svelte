<script lang="ts">
  import clsx from 'clsx';
  import { Tag } from '$lib/components';
  import type { JSONContent } from '@tiptap/core';
  import type { PostRevisionContentKind } from '$glitch';

  export let tags: string[] = [];
  export let kind: PostRevisionContentKind;
  export let content: JSONContent | undefined;

  let open = false;
  let description = '';

  $: if (content?.content) {
    description = content.content.find((c) => c.type === 'paragraph')?.content?.[0].text ?? '';
  }

  const createParagraph = (text: string) => {
    return {
      type: 'paragraph',
      attrs: {
        'text-align': null,
        'font-family': 'sans',
        'line-height': 'normal',
        'letter-spacing': 'normal',
      },
      content: [
        {
          type: 'text',
          text,
        },
      ],
    };
  };

  const handleInputChange = (e: Event) => {
    const { value } = e.target as HTMLInputElement;

    if (!content) {
      content = {
        type: 'document',
        content: [createParagraph(value)],
      };
    } else if (content.content) {
      if (content.content?.[0].type === 'paragraph') {
        content.content[0] = createParagraph(value);
      } else {
        content.content.unshift(createParagraph(value));
      }

      if (value === '') {
        content.content.shift();
      }
    }
  };
</script>

<div class="max-h-full fixed w-full z-1 bottom-0">
  <div class="flex flex-col items-center">
    <button
      class={clsx(
        'w-16 h-7.5 rounded-1.5 rounded-b-none flex center bg-white shadow-[0px_-5px_16px_-8px_rgba(0,0,0,0.15)]',
        !open && 'fixed z-1 bottom-54px',
      )}
      type="button"
      on:click={() => (open = !open)}
    >
      <i class={clsx('i-lc-chevron-down square-4 text-secondary', !open && 'transform rotate-180')} />
    </button>
  </div>

  <div
    class={clsx(
      'overflow-y-scroll max-h-80vh bg-white shadow-[0_4px_16px_0px_rgba(0,0,0,0.15)] px-4',
      !open && 'fixed w-full top-[calc(100vh-54px)]',
    )}
  >
    <div class="w-full max-w-300 flex items-center gap-4 flex-wrap pt-3 pb-4">
      <span class="body-13-b">게시글 태그</span>

      {#each tags as tag (tag)}
        <Tag class="gap-2 pointer-events-none" size="sm">
          {tag}
          <button
            class="i-lc-trash pointer-events-auto"
            type="button"
            on:click={() => (tags = tags.filter((t) => t !== tag))}
          />
        </Tag>
      {/each}

      <label class="flex items-center px-3 bg-primary rounded-8 body-13-b before:(content-['#'] mr-1)">
        <input
          class="body-13-b h-6.5"
          maxlength={50}
          placeholder="게시글에 추가될 태그를 입력하세요"
          type="text"
          on:keydown={(e) => {
            if (e.key !== ' ' && e.key !== 'Spacebar' && e.key !== 'Enter') return;

            const { value } = e.currentTarget;

            if (tags.includes(value)) return;
            const escapedValue = value.replaceAll(' ', '');

            if (escapedValue.length === 0) return;

            if (e.isComposing === false) {
              tags.push(escapedValue);
              tags = tags;
              e.currentTarget.value = '';
            }
          }}
        />
      </label>
    </div>

    <div class="w-full max-w-300 flex items-center gap-4 flex-wrap bg-primary p-4 mb-4">
      {#if kind === 'ARTICLE'}
        <div class="square-21.25 rounded-2xl border border-primary bg-surface-primary" />
      {:else}
        <input
          class="body-13-b resize-none w-full"
          placeholder="내용을 입력하세요"
          type="text"
          value={description}
          on:input={handleInputChange}
        />
      {/if}
    </div>
  </div>
</div>
