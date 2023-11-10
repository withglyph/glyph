<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import clsx from 'clsx';
  import { graphql } from '$glitch';
  import { Tag } from '$lib/components';
  import { warnOnUnload } from '$lib/svelte/lifecycle';
  import Editor from './Editor.svelte';
  import Header from './Header.svelte';
  // import Toolbar from './Toolbar.svelte';
  import type { Editor as TiptapEditor, JSONContent } from '@tiptap/core';

  warnOnUnload();

  $: query = graphql(`
    query PublishPage_Query {
      ...PublishPage_Header_query
    }
  `);

  let title: string;
  let subtitle: string;
  let editor: TiptapEditor;
  let content: JSONContent;

  let open = false;
  let tagList: string[] = [];
  let value = '';
</script>

<Helmet title="새 글 작성하기" />

<Header {$query} {content} {editor} {subtitle} {title} />

<main class="flex grow flex-col bg-primary">
  <div class="bg-white flex flex-col grow w-full max-w-262 mx-auto border-x border-secondary">
    <Editor bind:title bind:editor bind:subtitle bind:content />
  </div>
  <!-- <Toolbar {editor} /> -->

  <div class={clsx('fixed w-full z-10 bottom-0')}>
    <div class={clsx('flex justify-center', !open && 'fixed w-full bottom-0')}>
      <button
        class="w-16 h-7.5 rounded-1.5 rounded-b-none flex center bg-white w-16 shadow-[0_-6px_13px_0_rgba(0,0,0,0.15)]"
        type="button"
        on:click={() => (open = !open)}
      >
        <i class={clsx('i-lc-chevron-down square-4 text-secondary', !open && 'transform rotate-180')} />
      </button>
    </div>

    <div
      class={clsx(
        'bg-white p-4 sm:px-7.5 flex flex-col center shadow-[0_4px_16px_0_rgba(0,0,0,0.15)]',
        !open && '-mb-100%',
      )}
    >
      <div class="w-full max-w-300 flex items-center gap-4 flex-wrap">
        <span class="body-13-b">게시글 태그</span>

        {#each tagList as tag (tag)}
          <Tag size="sm">
            {tag}
            <button class="i-lc-trash" type="button" on:click={() => (tagList = tagList.filter((t) => t !== tag))} />
          </Tag>
        {/each}

        <label class="flex items-center px-3 bg-primary rounded-8 body-13-b before:(content-['#'] mr-1)">
          <input
            class="body-13-b h-6.5"
            maxlength={50}
            placeholder="게시글에 추가될 태그를 입력하세요"
            type="text"
            bind:value
            on:keydown={(e) => {
              if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
                if (tagList.includes(value)) return;

                if (value.replaceAll(' ', '') === '') return;

                if (e.isComposing === false) {
                  tagList = [...tagList, value.trimStart().trimEnd()];
                  value = '';
                }
              }
            }}
          />
        </label>
      </div>

      <div class="w-full max-w-300 flex items-center gap-4 flex-wrap bg-primary mt-4 p-4 max-h-100 overflow-y-scroll">
        <div class="square-21.25 rounded-2xl border border-primary bg-surface-primary" />
      </div>
    </div>
  </div>
</main>
