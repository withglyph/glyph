<script lang="ts">
  import { Button } from '$lib/components';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { TiptapFloatingMenu } from '$lib/tiptap/components';
  import { isValidImageFile, validImageMimes } from '$lib/utils';
  import { blockquotes, hr } from './formats.svelte';
  import type { Editor } from '@tiptap/core';

  export let editor: Editor;

  const offset = 16;

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

    <Menu {offset} placement="right-start">
      <div
        slot="value"
        class="flex items-center gap-2.5 body-14-sb text-secondary px-4 py-3 w-full rounded-lg hover:(bg-primary text-primary)"
      >
        <span class="p-1 border border-alphagray-15 rounded-lg flex center">
          <i class="i-lc-minus square-5" />
        </span>
        구분선 추가
      </div>

      {#each hr as kind (kind)}
        <MenuItem
          class="flex center gap-2 w-900px"
          on:click={() => {
            editor.chain().focus().setHorizontalRule(kind).run();
          }}
        >
          <hr class="w-11rem divider-preview" aria-label={`${kind} 번째 구분선`} data-kind={kind} />
        </MenuItem>
      {/each}
    </Menu>

    <Menu {offset} placement="right-start">
      <div
        slot="value"
        class="flex items-center gap-2.5 body-14-sb text-secondary px-4 py-3 w-full rounded-lg hover:(bg-primary text-primary)"
      >
        <span class="p-1 border border-alphagray-15 rounded-lg flex center">
          <i class="i-lc-quote square-5" />
        </span>
        인용구 추가
      </div>

      {#each blockquotes as kind (kind)}
        <MenuItem
          class="flex center gap-2 w-900px"
          on:click={() => {
            editor.chain().focus().setBlockquote(kind).run();
          }}
        >
          <blockquote class="blockquote-preview text-disabled" aria-label={`${kind} 번째 구분선`} data-kind={kind}>
            내용을 입력해주세요
          </blockquote>
        </MenuItem>
      {/each}
    </Menu>

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

<style>
  .divider-preview {
    --uno: bg-no-repeat border-none bg-center;

    &[data-kind='1'] {
      --uno: bg-gradient-to-r from-([currentColor] 50%) to-(transparent 50%) h-0.0625rem bg-repeat;
      background-size: 16px 1px;
    }

    &[data-kind='2'] {
      --uno: border-(solid [currentColor] 1px);
    }

    &[data-kind='3'] {
      --uno: border-(solid [currentColor] 1px) w-7.5rem;
    }

    &[data-kind='4'] {
      --uno: bg-[url(/horizontal-rules/4.svg)] h-1.8rem;
    }

    &[data-kind='5'] {
      --uno: bg-[url(/horizontal-rules/5.svg)] h-0.875rem;
    }

    &[data-kind='6'] {
      --uno: bg-[url(/horizontal-rules/6.svg)] h-0.91027rem;
    }

    &[data-kind='7'] {
      --uno: bg-[url(/horizontal-rules/7.svg)] h-1.25rem;
    }
  }

  .blockquote-preview {
    --uno: border-l-0.1875rem border-text-primary pl-0.625rem my-0.34375rem;

    &[data-kind='2'] {
      --uno: border-l-none;
      &:before {
        --uno: block content-[url(/blockquotes/carbon.svg)] w-2rem;
      }
    }

    &[data-kind='3'] {
      --uno: border-l-none;
      &:before {
        --uno: block content-[url(/blockquotes/carbon.svg)] w-2rem m-x-auto;
      }
      &:after {
        --uno: block content-[url(/blockquotes/carbon.svg)] w-2rem rotate-180 m-x-auto;
      }
    }
  }
</style>
