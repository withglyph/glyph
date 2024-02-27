<script lang="ts">
  import { onMount } from 'svelte';
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

<main class="flex grow flex-col bg-gray-50">
  <div class="bg-white flex flex-col grow w-full max-w-1062px mx-auto grow py-5 sm:pt-10.5">
    <div class="pb-5 mb-5 border-b border-gray-200 mx-5 sm:mx-20">
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

    <div class="px-5 w-full flex grow sm:px-20">
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
