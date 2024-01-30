<script lang="ts">
  import { Button } from '$lib/components';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { TiptapFloatingMenu } from '$lib/tiptap/components';
  import { values } from '$lib/tiptap/values';
  import { isValidImageFile, validImageMimes } from '$lib/utils';
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

<TiptapFloatingMenu {editor} leftOffset={48}>
  <Menu as="div" offset={16} placement="left-start">
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

      {#each values.horizontalRule as hr (hr.value)}
        <MenuItem
          class="flex center gap-2 w-900px"
          on:click={() => {
            editor.chain().focus().setHorizontalRule(hr.value).run();
          }}
        >
          <hr class="w-11rem divider-preview" aria-label={`${hr.value} 번째 구분선`} data-kind={hr.value} />
        </MenuItem>
      {/each}
    </Menu>

    <Menu as="button" {offset} placement="right-start">
      <button
        slot="value"
        class="flex items-center gap-2.5 body-14-sb text-secondary px-4 py-3 w-full rounded-lg hover:(bg-primary text-primary)"
        type="button"
        on:click={() => {
          if (editor.isActive('blockquote')) {
            editor.chain().focus().unsetBlockquote().run();
          }
        }}
      >
        <span class="p-1 border border-alphagray-15 rounded-lg flex center">
          <i class="i-lc-quote square-5" />
        </span>
        인용구
      </button>

      {#each values.blockquote as blockquote (blockquote.value)}
        <MenuItem
          class="flex center gap-2 w-900px"
          on:click={() => {
            editor.chain().focus().setBlockquote(blockquote.value).run();
          }}
        >
          <blockquote
            class="blockquote-preview text-disabled"
            aria-label={`${blockquote.value} 번째 구분선`}
            data-kind={blockquote.value}
          >
            내용을 입력해주세요
          </blockquote>
        </MenuItem>
      {/each}
    </Menu>

    <Menu {offset} placement="right-start">
      <div
        slot="value"
        class="flex items-center gap-2.5 body-14-sb text-secondary px-4 py-3 w-full rounded-lg hover:(bg-primary text-primary)"
      >
        <span class="p-1 border border-alphagray-15 rounded-lg flex center">
          <i class="i-lc-list square-5" />
        </span>
        리스트 추가
      </div>

      <MenuItem
        class="flex items-center gap-2 w-900px"
        on:click={() => {
          editor.chain().focus().toggleBulletList().run();
        }}
      >
        <i class="i-lc-list square-5" aria-label="순서 없는 리스트" />
        순서 없는 리스트
      </MenuItem>

      <MenuItem
        class="flex items-center gap-2"
        on:click={() => {
          editor.chain().focus().toggleOrderedList().run();
        }}
      >
        <i class="i-lc-list-ordered square-5" aria-label="번호 매겨진 리스트" />
        번호 매겨진 리스트
      </MenuItem>
    </Menu>

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
      background-image: linear-gradient(to right, currentColor 50%, rgb(255 255 255 / 0) 50%);
      background-repeat: repeat;
      background-size: 16px 1px;
      height: 0.0625rem;
    }

    &[data-kind='2'],
    &[data-kind='3'] {
      border: solid 1px currentColor;
    }

    &[data-kind='3'] {
      width: 7.5rem;
    }

    &[data-kind='4'] {
      --uno: h-1.8rem;
      background-image: url(https://penxle.com/horizontal-rules/4.svg);
    }

    &[data-kind='5'] {
      --uno: h-0.875rem;
      background-image: url(https://penxle.com/horizontal-rules/5.svg);
    }

    &[data-kind='6'] {
      --uno: h-0.91027rem;
      background-image: url(https://penxle.com/horizontal-rules/6.svg);
    }

    &[data-kind='7'] {
      --uno: h-1.25rem;
      background-image: url(https://penxle.com/horizontal-rules/7.svg);
    }
  }

  .blockquote-preview {
    --uno: border-l-0.1875rem border-text-primary pl-0.625rem my-0.34375rem;

    &[data-kind='2'] {
      --uno: border-l-none;
      &:before {
        --uno: block w-2rem;
        content: url(https://penxle.com/blockquotes/carbon.svg);
      }
    }

    &[data-kind='3'] {
      --uno: border-l-none;
      &:before {
        --uno: block w-2rem m-x-auto;
        content: url(https://penxle.com/blockquotes/carbon.svg);
      }
      &:after {
        --uno: block w-2rem rotate-180 m-x-auto;
        content: url(https://penxle.com/blockquotes/carbon.svg);
      }
    }
  }
</style>
