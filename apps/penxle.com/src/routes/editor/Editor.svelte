<script lang="ts">
  import ArticleEditor from './ArticleEditor.svelte';
  import type { Editor, JSONContent } from '@tiptap/core';
  import type { PostRevisionContentKind } from '$glitch';

  export let kind: PostRevisionContentKind;
  export let title: string;
  export let subtitle: string | null;
  export let content: JSONContent | undefined;
  export let editor: Editor | undefined;

  let enableSubtitle = !!subtitle;
</script>

<main class="flex grow flex-col bg-primary">
  <div class="bg-white flex flex-col grow w-full max-w-262 mx-auto border-x border-secondary pt-17">
    <div class="mx-auto w-full max-w-230">
      <input class="py-3 w-full title-32-eb border-b" placeholder="제목을 입력하세요" type="text" bind:value={title} />

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

      {#if kind === 'ARTICLE'}
        <ArticleEditor bind:editor bind:content />
      {:else}
        <div class="mx-auto w-full max-w-230 grow bg-primary" />
      {/if}
    </div>
  </div>
</main>
