<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '$lib/components';
  import ArticleEditor from './ArticleEditor.svelte';
  import type { Editor, JSONContent } from '@tiptap/core';
  import type { Writable } from 'svelte/store';

  export let autoSaveCount: Writable<number>;
  export let title: string | null;
  export let subtitle: string | null;
  export let content: JSONContent;
  export let editor: Editor | undefined;
  export let paragraphIndent: number;
  export let paragraphSpacing: number;

  function autoSave() {
    $autoSaveCount += 1;
  }

  onMount(() => {
    autoSave();

    const saveEventHandler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        autoSave();
      }
    };

    document.addEventListener('keydown', saveEventHandler);

    return () => {
      document.removeEventListener('keydown', saveEventHandler);
    };
  });
</script>

<div class="grow body-16-b flex center text-center bg-surface-primary px-5 sm:hidden">
  <div class="bg-cardprimary rounded-2xl w-full max-w-107.5 py-10 px-5 flex flex-col center text-center">
    모바일 에디터는 준비중이에요
    <br />
    조금만 기다려주세요!

    <Button class="w-fit mt-4" href="/" size="lg" type="link">메인으로 돌아가기</Button>
  </div>
</div>

<main class="flex grow flex-col bg-gray-50 <sm:hidden">
  <div class="bg-white flex flex-col grow w-full max-w-270 mx-auto pt-17 grow">
    <div class="mx-15 pb-5 mb-5 border-b border-gray-200">
      <input
        class="w-full text-28-sb"
        placeholder="제목을 입력하세요"
        type="text"
        bind:value={title}
        on:keydown={autoSave}
      />

      <input
        class="mt-1 w-full text-16-r"
        placeholder="부제목을 입력해주세요"
        type="text"
        bind:value={subtitle}
        on:keydown={autoSave}
      />
    </div>

    <ArticleEditor onChange={autoSave} {paragraphIndent} {paragraphSpacing} bind:editor bind:content />
  </div>
</main>
