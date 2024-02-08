<script lang="ts">
  import clsx from 'clsx';
  import { values } from '$lib/tiptap/values';
  import { isValidImageFile, validImageMimes } from '$lib/utils';
  import { getEditorContext } from './context';

  const { store, state } = getEditorContext();
  $: editor = $state.editor;

  let menuKind:
    | 'textColor'
    | 'fontFamily'
    | 'fontSize'
    | 'textAlign'
    | 'lineHeight'
    | 'letterSpacing'
    | 'paragraphIndent'
    | 'paragraphSpacing'
    | null = null;
  let bottomMenuKind: 'quote' | 'horizontalRule' | null = null;

  let textSettingOpen = false;
  let insertSettingOpen = false;
  let additionalSettingOpen = false;

  const handleInsertImage = () => {
    const picker = document.createElement('input');
    picker.type = 'file';
    picker.accept = validImageMimes.join(',');

    picker.addEventListener('change', async () => {
      const file = picker.files?.[0];

      if (!file || !(await isValidImageFile(file))) {
        return;
      }

      editor?.chain().focus().setImage(file).run();
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

      editor?.chain().focus().setFile(file).run();
    });

    picker.showPicker();
  };

  const colorPresets = [
    '#09090B',
    '#6B7280',
    '#FFFFFF',
    '#EF4444',
    '#F59E0B',
    '#10B981',
    '#3B82F6',
    '#6366F1',
    '#8B5CF6',
    '#EC4899',
  ];

  const paragraphIndentPresets = [
    { value: 0, label: '없음' },
    { value: 50, label: '0.5칸' },
    { value: 100, label: '1칸' },
    { value: 200, label: '2칸' },
  ];

  const paragraphSpacingPresets = [
    { value: 0, label: '없음' },
    { value: 50, label: '0.5줄' },
    { value: 100, label: '1줄' },
    { value: 200, label: '2줄' },
  ];

  $: currentColor = (editor?.getAttributes('font_color').fontColor as string | undefined) ?? values.color[0].value;
</script>

{#if menuKind}
  <div class="px-6 py-2.5 border-t border-gray-200 w-full fixed bottom-45px bg-white h-44px">
    {#if menuKind === 'textColor'}
      <div class="flex gap-4.5 overflow-x-auto">
        {#each colorPresets as preset (preset)}
          <button
            style:background-color={preset}
            class={clsx(
              'flex center flex-none square-4 rounded-full [&>i]:aria-pressed:block!',
              preset === '#FFFFFF' && 'border-(1px gray-200) [&>i]:aria-pressed:text-gray-950',
            )}
            aria-pressed={currentColor.toUpperCase() === preset}
            type="button"
            on:click={() => {
              if (preset === values.color[0].value.toUpperCase()) {
                editor?.chain().focus().unsetFontColor().run();
              } else {
                editor?.chain().focus().setFontColor(preset).run();
              }
            }}
          >
            <i class="i-tb-check square-3 text-white hidden" />
          </button>
        {/each}
      </div>
    {:else if menuKind === 'fontFamily'}
      <div class="flex gap-4.5 items-center overflow-x-auto overflow-y-hidden">
        {#each values.fontFamily as font (font.value)}
          <button
            style:font-family={`PNXL_${font.value}`}
            class={clsx('flex-none text-15-r aria-pressed:text-teal-500', font.value === 'Pretendard' && 'text-16-r')}
            aria-pressed={font.value === (editor?.getAttributes('font_family').fontFamily ?? 'Pretendard')}
            type="button"
            on:click={() => {
              if (font.value === values.fontFamily[0].value) {
                editor?.chain().focus().unsetFontFamily().run();
              } else {
                editor?.chain().focus().setFontFamily(font.value).run();
              }
            }}
          >
            {font.label}
          </button>
        {/each}
      </div>
    {:else if menuKind === 'fontSize'}
      <div class="flex gap-4.5 items-center overflow-x-auto">
        {#each values.fontSize as fontSize (fontSize.value)}
          <button
            class="text-15-r aria-pressed:text-teal-500"
            aria-pressed={fontSize.value === (editor?.getAttributes('font_size').fontSize ?? 16)}
            type="button"
            on:click={() => {
              if (fontSize.value === 16) {
                editor?.chain().focus().unsetFontSize().run();
              } else {
                editor?.chain().focus().setFontSize(fontSize.value).run();
              }
            }}
          >
            {fontSize.label.replace('pt', '')}
          </button>
        {/each}
      </div>
    {:else if menuKind === 'textAlign'}
      <div class="flex gap-4.5 items-center overflow-x-auto">
        {#each values.textAlign as textAlign (textAlign.value)}
          <button
            class="aria-pressed:text-teal-500"
            aria-pressed={editor?.isActive({ textAlign: textAlign.value })}
            type="button"
            on:click={() => editor?.chain().focus().setParagraphTextAlign(textAlign.value).run()}
          >
            <i class={clsx(textAlign.icon, 'square-6')} />
          </button>
        {/each}
      </div>
    {:else if menuKind === 'lineHeight'}
      <div class="flex gap-4.5 items-center overflow-x-auto">
        {#each values.lineHeight as lineHeight (lineHeight.value)}
          <button
            class="text-15-r aria-pressed:text-teal-500"
            aria-pressed={editor?.isActive({ lineHeight: lineHeight.value })}
            type="button"
            on:click={() => {
              editor?.chain().focus().setParagraphLineHeight(lineHeight.value).run();
            }}
          >
            {lineHeight.label}
          </button>
        {/each}
      </div>
    {:else if menuKind === 'letterSpacing'}
      <div class="flex gap-4.5 items-center overflow-x-auto">
        {#each values.letterSpacing as letterSpacing (letterSpacing.value)}
          <button
            class="text-15-r aria-pressed:text-teal-500"
            aria-pressed={editor?.isActive({ letterSpacing: letterSpacing.value })}
            type="button"
            on:click={() => {
              editor?.chain().focus().setParagraphLetterSpacing(letterSpacing.value).run();
            }}
          >
            {letterSpacing.label}
          </button>
        {/each}
      </div>
    {:else if menuKind === 'paragraphIndent'}
      <div class="flex gap-4.5 items-center overflow-x-auto">
        {#each paragraphIndentPresets as paragraphIndent (paragraphIndent.value)}
          <button
            class="text-15-r aria-pressed:text-teal-500"
            aria-pressed={$store.paragraphIndent === paragraphIndent.value}
            type="button"
            on:click={() => {
              $store.paragraphIndent = paragraphIndent.value;
            }}
          >
            {paragraphIndent.label}
          </button>
        {/each}
      </div>
    {:else if menuKind === 'paragraphSpacing'}
      <div class="flex gap-4.5 items-center overflow-x-auto">
        {#each paragraphSpacingPresets as paragraphSpacing (paragraphSpacing.value)}
          <button
            class="text-15-r aria-pressed:text-teal-500"
            aria-pressed={$store.paragraphSpacing === paragraphSpacing.value}
            type="button"
            on:click={() => {
              $store.paragraphSpacing = paragraphSpacing.value;
            }}
          >
            {paragraphSpacing.label}
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<div class="fixed bottom-0 bg-white border-t border-gray-200 w-full">
  <div class="px-5 py-3.5 h-54px flex items-center justify-between">
    {#if textSettingOpen}
      <div class="flex gap-4.5 overflow-x-auto">
        <button
          class="flex center after:(inline-block content-empty w-1px h-3.5 bg-gray-200 ml-2)"
          type="button"
          on:click={() => {
            menuKind = null;
            bottomMenuKind = null;
            textSettingOpen = false;
          }}
        >
          <i class="i-tb-arrow-left square-6 text-gray-400" />
        </button>

        <div class="flex items-center gap-2.5">
          <button
            aria-pressed={menuKind === 'textColor'}
            type="button"
            on:click={() => {
              menuKind = 'textColor';
            }}
          >
            <div
              style:background-color={currentColor}
              class={clsx(
                'rounded-full square-4.5',
                currentColor.toUpperCase() === '#FFFFFF' && 'border-(1px gray-200)',
              )}
            />
          </button>

          <button
            class="text-15-r whitespace-nowrap"
            aria-pressed={menuKind === 'fontFamily'}
            type="button"
            on:click={() => (menuKind = 'fontFamily')}
          >
            {values.fontFamily.find(({ value }) => editor?.getAttributes('font_family').fontFamily === value)?.label ??
              values.fontFamily[0].label}
          </button>

          <button aria-pressed={menuKind === 'fontSize'} type="button" on:click={() => (menuKind = 'fontSize')}>
            {values.fontSize
              .find(({ value }) => editor?.getAttributes('font_size').fontSize === value)
              ?.label.replace('pt', '') ?? values.fontSize[4].label.replace('pt', '')}
          </button>
        </div>

        <div class="flex items-center gap-4">
          <button type="button" on:click={() => editor?.chain().focus().toggleBold().run()}>
            <i class={clsx('i-tb-bold square-6', editor?.isActive('bold') && 'text-teal-500')} />
          </button>

          <button type="button" on:click={() => editor?.chain().focus().toggleItalic().run()}>
            <i class={clsx('i-tb-italic square-6', editor?.isActive('italic') && 'text-teal-500')} />
          </button>

          <button type="button" on:click={() => editor?.chain().focus().toggleStrike().run()}>
            <i class={clsx('i-tb-strikethrough square-6', editor?.isActive('strike') && 'text-teal-500')} />
          </button>

          <button type="button" on:click={() => editor?.chain().focus().toggleUnderline().run()}>
            <i class={clsx('i-tb-underline square-6', editor?.isActive('underline') && 'text-teal-500')} />
          </button>

          <button type="button">
            <i class="i-px2-ruby square-6" />
          </button>

          <button aria-pressed={menuKind === 'textAlign'} type="button" on:click={() => (menuKind = 'textAlign')}>
            <i class="i-tb-align-justified square-6" />
          </button>

          <button aria-pressed={menuKind === 'lineHeight'} type="button" on:click={() => (menuKind = 'lineHeight')}>
            <i class="i-px2-line-height square-6" />
          </button>

          <button
            aria-pressed={menuKind === 'letterSpacing'}
            type="button"
            on:click={() => (menuKind = 'letterSpacing')}
          >
            <i class="i-px2-letter-spacing square-6" />
          </button>
        </div>
      </div>
    {:else if insertSettingOpen}
      <div class="flex gap-4.5 overflow-x-auto">
        <button
          class="flex center after:(inline-block content-empty w-1px h-3.5 bg-gray-200 ml-2)"
          type="button"
          on:click={() => {
            menuKind = null;
            bottomMenuKind = null;
            insertSettingOpen = false;
          }}
        >
          <i class="i-tb-arrow-left square-6 text-gray-400" />
        </button>

        <div class="flex gap-4">
          <button
            class="i-tb-list square-6"
            type="button"
            on:click={() => {
              editor?.chain().focus().toggleBulletList().run();
            }}
          />

          <button
            class="i-tb-list-numbers square-6"
            type="button"
            on:click={() => {
              editor?.chain().focus().toggleOrderedList().run();
            }}
          />

          <button class="i-tb-quote square-6" type="button" on:click={() => (bottomMenuKind = 'quote')} />
        </div>

        <button class="i-tb-folder square-6" type="button" on:click={handleInsertFile} />

        <button
          class="i-tb-link square-6"
          disabled={editor?.isActive('link') || editor?.state.selection.empty}
          type="button"
          on:click={() => editor?.chain().focus().setLink('').run()}
        />
      </div>
    {:else if additionalSettingOpen}
      <div class="flex gap-4.5 overflow-x-auto">
        <button
          class="flex center after:(inline-block content-empty w-1px h-3.5 bg-gray-200 ml-2)"
          type="button"
          on:click={() => {
            menuKind = null;
            bottomMenuKind = null;
            additionalSettingOpen = false;
          }}
        >
          <i class="i-tb-arrow-left square-6 text-gray-400" />
        </button>

        <button
          class="text-15-r"
          type="button"
          on:click={() => {
            menuKind = 'paragraphIndent';
          }}
        >
          문단 들여쓰기
        </button>

        <button
          class="text-15-r"
          type="button"
          on:click={() => {
            menuKind = 'paragraphSpacing';
          }}
        >
          문단 사이간격
        </button>
      </div>
    {:else}
      <div class="flex gap-5.5">
        <button class="i-px2-text square-6.5" type="button" on:click={() => (textSettingOpen = true)} />

        <button class="i-tb-photo square-6.5" type="button" on:click={handleInsertImage} />

        <button class="i-tb-plus square-6.5" type="button" on:click={() => (insertSettingOpen = true)} />

        <button
          class="i-px2-quite-line square-6.5"
          type="button"
          on:click={() => (bottomMenuKind = 'horizontalRule')}
        />

        <button class="i-tb-settings square-6.5" type="button" on:click={() => (additionalSettingOpen = true)} />
      </div>
    {/if}
  </div>
  {#if bottomMenuKind}
    <div class="grid grid-cols-2 border-t border-gray-200">
      {#if bottomMenuKind === 'quote'}
        {#each values.blockquote as blockquote (blockquote.value)}
          <button
            class="flex center px-7 py-6.5"
            type="button"
            on:click={() => {
              editor?.chain().focus().setBlockquote(blockquote.value).run();
              bottomMenuKind = null;
              editor?.chain().focus();
            }}
          >
            <blockquote
              class="blockquote-preview text-disabled"
              aria-label={`${blockquote.value}번째 인용구`}
              data-kind={blockquote.value}
            >
              내용을 입력해주세요
            </blockquote>
          </button>
        {/each}
      {:else if bottomMenuKind === 'horizontalRule'}
        {#each values.horizontalRule as hr (hr.value)}
          <button
            class="flex center px-7 py-6.5"
            type="button"
            on:click={() => {
              editor?.chain().focus().setHorizontalRule(hr.value).run();
              bottomMenuKind = null;
              editor?.chain().focus();
            }}
          >
            <hr class="w-full divider-preview" aria-label={`${hr.value}번째 구분선`} data-kind={hr.value} />
          </button>
        {/each}
      {/if}
    </div>
  {/if}
</div>

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
      background-color: currentColor;
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
    --uno: border-l-3px border-gray-950 pl-1.5 text-9px;

    &[data-kind='2'] {
      --uno: border-l-none;
      &:before {
        --uno: block w-4;
        content: url(https://penxle.com/blockquotes/carbon.svg);
      }
    }

    &[data-kind='3'] {
      --uno: border-l-none;
      &:before {
        --uno: block w-4 m-x-auto;
        content: url(https://penxle.com/blockquotes/carbon.svg);
      }
      &:after {
        --uno: block w-4 rotate-180 m-x-auto;
        content: url(https://penxle.com/blockquotes/carbon.svg);
      }
    }
  }
</style>
