<script lang="ts">
  import IconHorizontalRule from '~icons/effit/horizontal-rule';
  import IconLetterSpacing from '~icons/effit/letter-spacing';
  import IconLineHeight from '~icons/effit/line-height';
  import IconRuby from '~icons/effit/ruby';
  import IconText from '~icons/effit/text';
  import IconArrowLeft from '~icons/tabler/arrow-left';
  import IconBold from '~icons/tabler/bold';
  import IconCheck from '~icons/tabler/check';
  import IconFolder from '~icons/tabler/folder';
  import IconItalic from '~icons/tabler/italic';
  import IconLink from '~icons/tabler/link';
  import IconList from '~icons/tabler/list';
  import IconListNumbers from '~icons/tabler/list-numbers';
  import IconPhoto from '~icons/tabler/photo';
  import IconPlus from '~icons/tabler/plus';
  import IconQuote from '~icons/tabler/quote';
  import IconSettings from '~icons/tabler/settings';
  import IconStrikethrough from '~icons/tabler/strikethrough';
  import IconUnderline from '~icons/tabler/underline';
  import { Icon } from '$lib/components';
  import { values } from '$lib/tiptap/values';
  import { isValidImageFile, validImageMimes } from '$lib/utils';
  import { css, cx } from '$styled-system/css';
  import { center, flex, grid } from '$styled-system/patterns';
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

<div
  class={flex({ direction: 'column', color: 'gray.800', backgroundColor: 'white', hideFrom: 'sm' })}
  on:touchend|nonpassive|preventDefault
>
  <div
    class={flex({
      align: 'center',
      gap: '20px',
      borderBottomWidth: '1px',
      borderBottomColor: 'gray.200',
      paddingX: '20px',
      paddingY: '14px',
      width: 'full',
      overflowX: 'auto',
      scrollbar: 'hidden',
      touchAction: 'pan-x',
    })}
  >
    {#if topMenu === 'default'}
      <MobileToolbarButton on:click={() => (topMenu = 'text')}>
        <Icon style={css.raw({ size: '26px' })} icon={IconText} />
      </MobileToolbarButton>

      <MobileToolbarButton on:click={handleInsertImage}>
        <Icon style={css.raw({ size: '26px' })} icon={IconPhoto} />
      </MobileToolbarButton>

      <MobileToolbarButton on:click={() => (topMenu = 'insert')}>
        <Icon style={css.raw({ size: '26px' })} icon={IconPlus} />
      </MobileToolbarButton>

      <MobileToolbarButton on:click={() => toggleBottomMenu('horizontalRule')}>
        <Icon style={css.raw({ size: '26px' })} icon={IconHorizontalRule} />
      </MobileToolbarButton>

      <MobileToolbarButton on:click={() => (topMenu = 'options')}>
        <Icon style={css.raw({ size: '26px' })} icon={IconSettings} />
      </MobileToolbarButton>
    {:else}
      <MobileToolbarButton on:click={() => (topMenu = 'default')}>
        <Icon style={css.raw({ size: '26px', color: 'gray.400' })} icon={IconArrowLeft} />
      </MobileToolbarButton>

      <div class={css({ flex: 'none', width: '1px', height: '14px', backgroundColor: 'gray.200' })} />

      <div class={flex({ align: 'center', gap: '20px', overflowX: 'auto', scrollbar: 'hidden', touchAction: 'pan-x' })}>
        {#if topMenu === 'text'}
          <MobileToolbarButton on:click={() => toggleSubMenu('textColor')}>
            <div
              style:background-color={currentColor}
              class={css(
                { borderRadius: 'full', size: '24px' },
                currentColor.toUpperCase() === '#FFFFFF' && { borderWidth: '1px', borderColor: 'gray.200' },
              )}
            />
          </MobileToolbarButton>

          <MobileToolbarButton
            class={css({ flex: 'none', paddingX: '5px' })}
            on:click={() => toggleSubMenu('fontFamily')}
          >
            {values.fontFamily.find(({ value }) => editor?.getAttributes('font_family').fontFamily === value)?.label ??
              values.fontFamily[0].label}
          </MobileToolbarButton>

          <MobileToolbarButton
            class={css({ flex: 'none', paddingX: '5px', width: '30px' })}
            on:click={() => toggleSubMenu('fontSize')}
          >
            {values.fontSize
              .find(({ value }) => editor?.getAttributes('font_size').fontSize === value)
              ?.label.replace('pt', '') ?? '16'}
          </MobileToolbarButton>

          <MobileToolbarButton on:click={() => editor?.chain().focus().toggleBold().run()}>
            <Icon
              style={css.raw({ size: '26px' }, editor?.isActive('bold') && { color: 'teal.500' })}
              icon={IconBold}
            />
          </MobileToolbarButton>

          <MobileToolbarButton on:click={() => editor?.chain().focus().toggleItalic().run()}>
            <Icon
              style={css.raw({ size: '26px' }, editor?.isActive('italic') && { color: 'teal.500' })}
              icon={IconItalic}
            />
          </MobileToolbarButton>

          <MobileToolbarButton on:click={() => editor?.chain().focus().toggleStrike().run()}>
            <Icon
              style={css.raw({ size: '26px' }, editor?.isActive('strike') && { color: 'teal.500' })}
              icon={IconStrikethrough}
            />
          </MobileToolbarButton>

          <MobileToolbarButton on:click={() => editor?.chain().focus().toggleUnderline().run()}>
            <Icon
              style={css.raw({ size: '26px' }, editor?.isActive('underline') && { color: 'teal.500' })}
              icon={IconUnderline}
            />
          </MobileToolbarButton>

          <MobileToolbarButton
            disabled={editor?.isActive('ruby') || editor?.state.selection.empty}
            on:click={() => editor?.chain().focus().setRuby('').run()}
          >
            <Icon style={css.raw({ size: '26px' })} icon={IconRuby} />
          </MobileToolbarButton>

          <MobileToolbarButton on:click={() => toggleSubMenu('textAlign')}>
            <Icon
              style={css.raw({ size: '26px' })}
              icon={values.textAlign.find(({ value }) => value === editor?.getAttributes('paragraph').textAlign)
                ?.icon ?? values.textAlign[0].icon}
            />
          </MobileToolbarButton>

          <MobileToolbarButton on:click={() => toggleSubMenu('lineHeight')}>
            <Icon style={css.raw({ size: '26px' })} icon={IconLineHeight} />
          </MobileToolbarButton>

          <MobileToolbarButton on:click={() => toggleSubMenu('letterSpacing')}>
            <Icon style={css.raw({ size: '26px' })} icon={IconLetterSpacing} />
          </MobileToolbarButton>
        {:else if topMenu === 'insert'}
          <MobileToolbarButton on:click={() => editor?.chain().focus().toggleBulletList().run()}>
            <Icon style={css.raw({ size: '26px' })} icon={IconList} />
          </MobileToolbarButton>

          <MobileToolbarButton on:click={() => editor?.chain().focus().toggleOrderedList().run()}>
            <Icon style={css.raw({ size: '26px' })} icon={IconListNumbers} />
          </MobileToolbarButton>

          <MobileToolbarButton on:click={() => toggleBottomMenu('quote')}>
            <Icon style={css.raw({ size: '26px' })} icon={IconQuote} />
          </MobileToolbarButton>

          <MobileToolbarButton on:click={handleInsertFile}>
            <Icon style={css.raw({ size: '26px' })} icon={IconFolder} />
          </MobileToolbarButton>

          <MobileToolbarButton
            disabled={editor?.isActive('link') || editor?.state.selection.empty}
            on:click={() => editor?.chain().focus().setLink('').run()}
          >
            <Icon style={css.raw({ size: '26px' })} icon={IconLink} />
          </MobileToolbarButton>
        {:else if topMenu === 'options'}
          <MobileToolbarButton on:click={() => toggleSubMenu('paragraphIndent')}>문단 들여쓰기</MobileToolbarButton>

          <MobileToolbarButton on:click={() => toggleSubMenu('paragraphSpacing')}>문단 사이간격</MobileToolbarButton>
        {/if}
      </div>
    {/if}
  </div>

  {#if subMenu}
    <div
      class={flex({
        align: 'center',
        borderBottomWidth: '1px',
        borderBottomColor: 'gray.200',
        paddingX: '20px',
        paddingY: '14px',
        width: 'full',
        overflowX: 'auto',
        scrollbar: 'hidden',
        touchAction: 'pan-x',
      })}
    >
      {#if subMenu === 'textColor'}
        <div class={flex({ gap: '24px' })}>
          {#each colorPresets as color (color)}
            <MobileToolbarButton
              style={`background-color: ${color};`}
              class={center({
                flex: 'none',
                borderWidth: '1px',
                borderColor: color === '#FFFFFF' ? 'gray.200' : 'transparent',
                borderRadius: 'full',
                size: '24px',
              })}
              on:click={() => {
                if (color === values.defaultColor) {
                  editor?.chain().focus().unsetFontColor().run();
                } else {
                  editor?.chain().focus().setFontColor(color).run();
                }
              }}
            >
              <Icon
                style={css.raw(
                  { size: '12px', color: color === '#FFFFFF' ? 'gray.950' : 'white' },
                  currentColor.toUpperCase() !== color && { display: 'none' },
                )}
                icon={IconCheck}
              />
            </MobileToolbarButton>
          {/each}
        </div>
      {:else if subMenu === 'fontFamily'}
        <div class={flex({ gap: '10px' })}>
          {#each values.fontFamily as fontFamily (fontFamily.value)}
            <MobileToolbarButton
              style={`font-family: PNXL_${fontFamily.value};`}
              class={css(
                { flex: 'none', paddingX: '5px', fontSize: fontFamily.value === 'Pretendard' ? '17px' : '16px' },
                fontFamily.value === (editor?.getAttributes('font_family').fontFamily ?? 'Pretendard') && {
                  color: 'teal.500',
                },
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
        <div class={flex({ gap: '24px' })}>
          {#each values.fontSize as fontSize (fontSize.value)}
            <MobileToolbarButton
              class={css(
                { paddingX: '5px' },
                fontSize.value === (editor?.getAttributes('font_size').fontSize ?? 16) && { color: 'teal.500' },
              )}
              on:click={() => editor?.chain().focus().setFontSize(fontSize.value).focus().run()}
            >
              {fontSize.label.replace('pt', '')}
            </MobileToolbarButton>
          {/each}
        </div>
      {:else if subMenu === 'textAlign'}
        <div class={flex({ gap: '20px' })}>
          {#each values.textAlign as textAlign (textAlign.value)}
            <MobileToolbarButton on:click={() => editor?.chain().focus().setParagraphTextAlign(textAlign.value).run()}>
              <Icon
                style={css.raw(
                  { size: '26px' },
                  editor?.isActive({ textAlign: textAlign.value }) && { color: 'teal.500' },
                )}
                icon={textAlign.icon}
              />
            </MobileToolbarButton>
          {/each}
        </div>
      {:else if subMenu === 'lineHeight'}
        <div class={flex({ gap: '24px' })}>
          {#each values.lineHeight as lineHeight (lineHeight.value)}
            <MobileToolbarButton
              class={css(
                { paddingX: '5px' },
                editor?.isActive({ lineHeight: lineHeight.value }) && { color: 'teal.500' },
              )}
              on:click={() => editor?.chain().focus().setParagraphLineHeight(lineHeight.value).run()}
            >
              {lineHeight.label}
            </MobileToolbarButton>
          {/each}
        </div>
      {:else if subMenu === 'letterSpacing'}
        <div class={flex({ gap: '22px' })}>
          {#each values.letterSpacing as letterSpacing (letterSpacing.value)}
            <MobileToolbarButton
              class={css(
                { paddingX: '5px' },
                editor?.isActive({ letterSpacing: letterSpacing.value }) && { color: 'teal.500' },
              )}
              on:click={() => editor?.chain().focus().setParagraphLetterSpacing(letterSpacing.value).run()}
            >
              {letterSpacing.label}
            </MobileToolbarButton>
          {/each}
        </div>
      {:else if subMenu === 'paragraphIndent'}
        <div class={flex({ gap: '20px' })}>
          {#each paragraphIndentPresets as paragraphIndent (paragraphIndent.value)}
            <MobileToolbarButton
              class={css(
                { paddingX: '5px' },
                $store.paragraphIndent === paragraphIndent.value && { color: 'teal.500' },
              )}
              on:click={() => ($store.paragraphIndent = paragraphIndent.value)}
            >
              {paragraphIndent.label}
            </MobileToolbarButton>
          {/each}
        </div>
      {:else if subMenu === 'paragraphSpacing'}
        <div class={flex({ gap: '20px' })}>
          {#each paragraphSpacingPresets as paragraphSpacing (paragraphSpacing.value)}
            <MobileToolbarButton
              class={css(
                { paddingX: '5px' },
                $store.paragraphSpacing === paragraphSpacing.value && { color: 'teal.500' },
              )}
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
    <div class={grid({ columns: 2, borderBottomWidth: '1px', borderBottomColor: 'gray.200', touchAction: 'none' })}>
      {#if bottomMenu === 'quote'}
        {#each values.blockquote as blockquote (blockquote.value)}
          <MobileToolbarButton
            class={center({ paddingX: '28px', paddingY: '26px' })}
            on:click={() => {
              editor?.chain().focus().setBlockquote(blockquote.value).run();
              setTimeout(() => {
                bottomMenu = null;
              }, 0);
            }}
          >
            <blockquote
              class={cx('blockquote-preview', css({ color: 'gray.400' }))}
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
            class={center({ paddingX: '28px', paddingY: '26px' })}
            on:click={() => {
              editor?.chain().focus().setHorizontalRule(hr.value).run();
              setTimeout(() => {
                bottomMenu = null;
              }, 0);
            }}
          >
            <hr
              class={cx('divider-preview', css({ width: 'full' }))}
              aria-label={`${hr.value}번째 구분선`}
              data-kind={hr.value}
            />
          </MobileToolbarButton>
        {/each}
      {/if}
    </div>
  {/if}
</div>

<style>
  .divider-preview {
    border-style: none;
    background-position: center;
    background-repeat: no-repeat;

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
      height: 1.8rem;
      background-image: url(https://pencil.so/horizontal-rules/4.svg);
    }

    &[data-kind='5'] {
      height: 0.875rem;
      background-image: url(https://pencil.so/horizontal-rules/5.svg);
    }

    &[data-kind='6'] {
      height: 0.91027rem;
      background-image: url(https://pencil.so/horizontal-rules/6.svg);
    }

    &[data-kind='7'] {
      height: 1.25rem;
      background-image: url(https://pencil.so/horizontal-rules/7.svg);
    }

    &[data-kind='8'] {
      height: 0.75rem;
      background-image: url(https://pencil.so/horizontal-rules/8.svg);
    }
  }

  .blockquote-preview {
    border-left-width: 3px;
    border-color: #09090b;
    padding-left: 6px;
    font-size: 9px;

    &[data-kind='2'] {
      &:before {
        display: block;
        width: 16px;
        content: url(https://pencil.so/blockquotes/carbon.svg);
      }
    }

    &[data-kind='3'] {
      border-left-style: none;
      &:before {
        display: block;
        width: 16px;
        margin-left: auto;
        margin-right: auto;
        content: url(https://pencil.so/blockquotes/carbon.svg);
      }
      &:after {
        display: block;
        width: 16px;
        margin-left: auto;
        margin-right: auto;
        transform: rotate(180deg);
        content: url(https://pencil.so/blockquotes/carbon.svg);
      }
    }
  }
</style>
