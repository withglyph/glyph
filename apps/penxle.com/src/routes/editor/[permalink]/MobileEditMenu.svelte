<script lang="ts">
  import clsx from 'clsx';
  import { values } from '$lib/tiptap/values';
  import { isValidImageFile, validImageMimes } from '$lib/utils';
  import { getEditorContext } from './context';
  import MobileToolbarButton from './MobileToolbarButton.svelte';

  const { store, state } = getEditorContext();
  $: editor = $state.editor;

  type TopMenu = 'default' | 'text' | 'insert' | 'options';
  type SubMenu =
    | 'textColor'
    | 'fontFamily'
    | 'fontSize'
    | 'textAlign'
    | 'lineHeight'
    | 'letterSpacing'
    | 'paragraphIndent'
    | 'paragraphSpacing';
  type BottomMenu = 'quote' | 'horizontalRule';

  let topMenu: TopMenu = 'default';
  let subMenu: SubMenu | null = null;
  let bottomMenu: BottomMenu | null = null;

  $: if (topMenu === 'default') {
    subMenu = null;
    bottomMenu = null;
  }

  const toggleSubMenu = (menu: SubMenu) => {
    subMenu = subMenu === menu ? null : menu;
  };

  const toggleBottomMenu = (menu: BottomMenu) => {
    bottomMenu = bottomMenu === menu ? null : menu;
  };

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

  $: currentColor =
    (editor?.getAttributes('font_color').fontColor as string | undefined)?.toUpperCase() ?? values.defaultColor;
</script>

<div class="flex flex-col bg-white text-gray-800 sm:hidden" on:touchend|nonpassive|preventDefault>
  <div
    class="border-b border-gray-200 w-full px-20px py-14px flex items-center gap-20px overflow-x-auto [&::-webkit-scrollbar]:hidden touch-pan-x"
  >
    {#if topMenu === 'default'}
      <MobileToolbarButton class="i-px2-text square-26px" on:click={() => (topMenu = 'text')} />

      <MobileToolbarButton class="i-tb-photo square-26px" on:click={handleInsertImage} />

      <MobileToolbarButton class="i-tb-plus square-26px" on:click={() => (topMenu = 'insert')} />

      <MobileToolbarButton class="i-px2-quite-line square-26px" on:click={() => toggleBottomMenu('horizontalRule')} />

      <MobileToolbarButton class="i-tb-settings square-26px" on:click={() => (topMenu = 'options')} />
    {:else}
      <MobileToolbarButton class="i-tb-arrow-left square-26px text-gray-400" on:click={() => (topMenu = 'default')} />

      <div class="w-1px h-14px flex-none bg-gray-200" />

      <div class="flex items-center gap-20px overflow-x-auto [&::-webkit-scrollbar]:hidden touch-pan-x">
        {#if topMenu === 'text'}
          <MobileToolbarButton on:click={() => toggleSubMenu('textColor')}>
            <div
              style:background-color={currentColor}
              class={clsx(
                'rounded-full square-24px',
                currentColor.toUpperCase() === '#FFFFFF' && 'border border-gray-200',
              )}
            />
          </MobileToolbarButton>

          <MobileToolbarButton class="text-16-r flex-none px-5px" on:click={() => toggleSubMenu('fontFamily')}>
            {values.fontFamily.find(({ value }) => editor?.getAttributes('font_family').fontFamily === value)?.label ??
              values.fontFamily[0].label}
          </MobileToolbarButton>

          <MobileToolbarButton class="text-16-r flex-none px-5px w-30px" on:click={() => toggleSubMenu('fontSize')}>
            {values.fontSize
              .find(({ value }) => editor?.getAttributes('font_size').fontSize === value)
              ?.label.replace('pt', '') ?? '16'}
          </MobileToolbarButton>

          <MobileToolbarButton
            class={clsx('i-tb-bold square-26px', editor?.isActive('bold') && 'text-teal-500')}
            on:click={() => editor?.chain().focus().toggleBold().run()}
          />

          <MobileToolbarButton
            class={clsx('i-tb-italic square-26px', editor?.isActive('italic') && 'text-teal-500')}
            on:click={() => editor?.chain().focus().toggleItalic().run()}
          />

          <MobileToolbarButton
            class={clsx('i-tb-strikethrough square-26px', editor?.isActive('strike') && 'text-teal-500')}
            on:click={() => editor?.chain().focus().toggleStrike().run()}
          />

          <MobileToolbarButton
            class={clsx('i-tb-underline square-26px', editor?.isActive('underline') && 'text-teal-500')}
            on:click={() => editor?.chain().focus().toggleUnderline().run()}
          />

          <MobileToolbarButton
            class="i-px2-ruby square-26px"
            disabled={editor?.isActive('ruby') || editor?.state.selection.empty}
            on:click={() => editor?.chain().focus().setRuby('').run()}
          />

          <MobileToolbarButton
            class={clsx(
              'square-26px',
              values.textAlign.find(({ value }) => value === editor?.getAttributes('paragraph').textAlign)?.icon ??
                values.textAlign[0].icon,
            )}
            on:click={() => toggleSubMenu('textAlign')}
          />

          <MobileToolbarButton class="i-px2-line-height square-26px" on:click={() => toggleSubMenu('lineHeight')} />

          <MobileToolbarButton
            class="i-px2-letter-spacing square-26px"
            on:click={() => toggleSubMenu('letterSpacing')}
          />
        {:else if topMenu === 'insert'}
          <MobileToolbarButton
            class="i-tb-list square-26px"
            on:click={() => editor?.chain().focus().toggleBulletList().run()}
          />

          <MobileToolbarButton
            class="i-tb-list-numbers square-26px"
            on:click={() => editor?.chain().focus().toggleOrderedList().run()}
          />

          <MobileToolbarButton class="i-tb-quote square-26px" on:click={() => toggleBottomMenu('quote')} />

          <MobileToolbarButton class="i-tb-folder square-26px" on:click={handleInsertFile} />

          <MobileToolbarButton
            class="i-tb-link square-26px"
            disabled={editor?.isActive('link') || editor?.state.selection.empty}
            on:click={() => editor?.chain().focus().setLink('').run()}
          />
        {:else if topMenu === 'options'}
          <MobileToolbarButton class="text-16-r" on:click={() => toggleSubMenu('paragraphIndent')}>
            문단 들여쓰기
          </MobileToolbarButton>

          <MobileToolbarButton class="text-16-r" on:click={() => toggleSubMenu('paragraphSpacing')}>
            문단 사이간격
          </MobileToolbarButton>
        {/if}
      </div>
    {/if}
  </div>

  {#if subMenu}
    <div
      class="border-b border-gray-200 w-full px-20px py-14px flex items-center gap-20px overflow-x-auto [&::-webkit-scrollbar]:hidden touch-pan-x"
    >
      {#if subMenu === 'textColor'}
        <div class="flex gap-24px">
          {#each colorPresets as color (color)}
            <MobileToolbarButton
              style={`background-color: ${color};`}
              class={clsx(
                'flex center flex-none square-24px rounded-full border',
                color === '#FFFFFF' ? 'border-gray-200' : 'border-transparent',
              )}
              on:click={() => {
                if (color === values.defaultColor) {
                  editor?.chain().focus().unsetFontColor().run();
                } else {
                  editor?.chain().focus().setFontColor(color).run();
                }
              }}
            >
              <i
                class={clsx(
                  'i-tb-check square-12px',
                  currentColor.toUpperCase() !== color && 'hidden',
                  color === '#FFFFFF' ? 'text-gray-950' : 'text-white',
                )}
              />
            </MobileToolbarButton>
          {/each}
        </div>
      {:else if subMenu === 'fontFamily'}
        <div class="flex gap-10px">
          {#each values.fontFamily as fontFamily (fontFamily.value)}
            <MobileToolbarButton
              style={`font-family: PNXL_${fontFamily.value};`}
              class={clsx(
                'flex-none px-5px',
                fontFamily.value === (editor?.getAttributes('font_family').fontFamily ?? 'Pretendard') &&
                  'text-teal-500',
                fontFamily.value === 'Pretendard' ? 'text-17-r' : 'text-16-r',
              )}
              on:click={() => {
                if (fontFamily.value === values.fontFamily[0].value) {
                  editor?.chain().focus().unsetFontFamily().run();
                } else {
                  editor?.chain().focus().setFontFamily(fontFamily.value).run();
                }
              }}
            >
              {fontFamily.label}
            </MobileToolbarButton>
          {/each}
        </div>
      {:else if subMenu === 'fontSize'}
        <div class="flex gap-24px text-16-r">
          {#each values.fontSize as fontSize (fontSize.value)}
            <MobileToolbarButton
              class={clsx(
                'px-5px',
                fontSize.value === (editor?.getAttributes('font_size').fontSize ?? 16) && 'text-teal-500',
              )}
              on:click={() => editor?.chain().focus().setFontSize(fontSize.value).focus().run()}
            >
              {fontSize.label.replace('pt', '')}
            </MobileToolbarButton>
          {/each}
        </div>
      {:else if subMenu === 'textAlign'}
        <div class="flex gap-20px">
          {#each values.textAlign as textAlign (textAlign.value)}
            <MobileToolbarButton
              class={clsx(
                'square-26px',
                textAlign.icon,
                editor?.isActive({ textAlign: textAlign.value }) && 'text-teal-500',
              )}
              on:click={() => editor?.chain().focus().setParagraphTextAlign(textAlign.value).run()}
            />
          {/each}
        </div>
      {:else if subMenu === 'lineHeight'}
        <div class="flex gap-24px text-16-r">
          {#each values.lineHeight as lineHeight (lineHeight.value)}
            <MobileToolbarButton
              class={clsx('px-5px', editor?.isActive({ lineHeight: lineHeight.value }) && 'text-teal-500')}
              on:click={() => editor?.chain().focus().setParagraphLineHeight(lineHeight.value).run()}
            >
              {lineHeight.label}
            </MobileToolbarButton>
          {/each}
        </div>
      {:else if subMenu === 'letterSpacing'}
        <div class="flex gap-22px text-16-r">
          {#each values.letterSpacing as letterSpacing (letterSpacing.value)}
            <MobileToolbarButton
              class={clsx('px-5px', editor?.isActive({ letterSpacing: letterSpacing.value }) && 'text-teal-500')}
              on:click={() => editor?.chain().focus().setParagraphLetterSpacing(letterSpacing.value).run()}
            >
              {letterSpacing.label}
            </MobileToolbarButton>
          {/each}
        </div>
      {:else if subMenu === 'paragraphIndent'}
        <div class="flex gap-20px text-16-r">
          {#each paragraphIndentPresets as paragraphIndent (paragraphIndent.value)}
            <MobileToolbarButton
              class={clsx('px-5px', $store.paragraphIndent === paragraphIndent.value && 'text-teal-500')}
              on:click={() => ($store.paragraphIndent = paragraphIndent.value)}
            >
              {paragraphIndent.label}
            </MobileToolbarButton>
          {/each}
        </div>
      {:else if subMenu === 'paragraphSpacing'}
        <div class="flex gap-4.5 items-center overflow-x-auto">
          {#each paragraphSpacingPresets as paragraphSpacing (paragraphSpacing.value)}
            <MobileToolbarButton
              class={clsx('px-5px', $store.paragraphSpacing === paragraphSpacing.value && 'text-teal-500')}
              on:click={() => ($store.paragraphSpacing = paragraphSpacing.value)}
            >
              {paragraphSpacing.label}
            </MobileToolbarButton>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  {#if bottomMenu}
    <div class="grid grid-cols-2 border-b border-gray-200 touch-none">
      {#if bottomMenu === 'quote'}
        {#each values.blockquote as blockquote (blockquote.value)}
          <MobileToolbarButton
            class="flex center px-7 py-6.5"
            on:click={() => {
              editor?.chain().focus().setBlockquote(blockquote.value).run();
              setTimeout(() => {
                bottomMenu = null;
              }, 0);
            }}
          >
            <blockquote
              class="blockquote-preview text-disabled"
              aria-label={`${blockquote.value}번째 인용구`}
              data-kind={blockquote.value}
            >
              내용을 입력해주세요
            </blockquote>
          </MobileToolbarButton>
        {/each}
      {:else if bottomMenu === 'horizontalRule'}
        {#each values.horizontalRule as hr (hr.value)}
          <MobileToolbarButton
            class="flex center px-7 py-6.5"
            on:click={() => {
              editor?.chain().focus().setHorizontalRule(hr.value).run();
              setTimeout(() => {
                bottomMenu = null;
              }, 0);
            }}
          >
            <hr class="w-full divider-preview" aria-label={`${hr.value}번째 구분선`} data-kind={hr.value} />
          </MobileToolbarButton>
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
      background-image: url(https://pencil.so/horizontal-rules/4.svg);
    }

    &[data-kind='5'] {
      --uno: h-0.875rem;
      background-image: url(https://pencil.so/horizontal-rules/5.svg);
    }

    &[data-kind='6'] {
      --uno: h-0.91027rem;
      background-image: url(https://pencil.so/horizontal-rules/6.svg);
    }

    &[data-kind='7'] {
      --uno: h-1.25rem;
      background-image: url(https://pencil.so/horizontal-rules/7.svg);
    }

    &[data-kind='8'] {
      --uno: h-0.75rem;
      background-image: url(https://pencil.so/horizontal-rules/8.svg);
    }
  }

  .blockquote-preview {
    --uno: border-l-3px border-gray-950 pl-1.5 text-9px;

    &[data-kind='2'] {
      --uno: border-l-none;
      &:before {
        --uno: block w-4;
        content: url(https://pencil.so/blockquotes/carbon.svg);
      }
    }

    &[data-kind='3'] {
      --uno: border-l-none;
      &:before {
        --uno: block w-4 m-x-auto;
        content: url(https://pencil.so/blockquotes/carbon.svg);
      }
      &:after {
        --uno: block w-4 rotate-180 m-x-auto;
        content: url(https://pencil.so/blockquotes/carbon.svg);
      }
    }
  }
</style>
