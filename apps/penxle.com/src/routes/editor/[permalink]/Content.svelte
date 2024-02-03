<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '$lib/components';
  import { TiptapEditor } from '$lib/tiptap/components';
  import { getEditorContext } from './context';
  import ArticleLinkEditMenu from './InlineLinkMenu.svelte';
  import ArticleRubyEditMenu from './InlineRubyMenu.svelte';

  const { store, state } = getEditorContext();

  onMount(() => {
    const saveEventHandler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
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
        maxlength="100"
        placeholder="제목을 입력하세요"
        type="text"
        bind:value={$store.title}
      />

      <input
        class="mt-1 w-full text-16-r"
        maxlength="100"
        placeholder="부제목을 입력해주세요"
        type="text"
        bind:value={$store.subtitle}
      />
    </div>

    <div class="px-15 w-full flex grow">
      <TiptapEditor
        class="mb-100px max-w-full grow"
        options={$store}
        bind:editor={$state.editor}
        bind:content={$store.content}
      />
    </div>

    {#if $state.editor}
      <ArticleLinkEditMenu editor={$state.editor} />
      <ArticleRubyEditMenu editor={$state.editor} />
    {/if}
  </div>
</main>
