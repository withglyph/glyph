<script lang="ts">
  import './toolbar-preview.css';

  import IconHorizontalRule from '~icons/glyph/horizontal-rule';
  import IconLetterSpacing from '~icons/glyph/letter-spacing';
  import IconLineHeight from '~icons/glyph/line-height';
  import IconRuby from '~icons/glyph/ruby';
  import IconText from '~icons/glyph/text';
  import IconArrowLeft from '~icons/tabler/arrow-left';
  import IconBold from '~icons/tabler/bold';
  import IconCheck from '~icons/tabler/check';
  import IconCode from '~icons/tabler/code';
  import IconFolder from '~icons/tabler/folder';
  import IconHtml from '~icons/tabler/html';
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
  import { Menu } from '$lib/components/menu';
  import { values } from '$lib/tiptap/values';
  import { validImageMimes } from '$lib/utils';
  import { css, cx } from '$styled-system/css';
  import { center, flex, grid } from '$styled-system/patterns';
  import { getEditorContext } from './context';
  import LinkModal from './LinkModal.svelte';
  import MobileToolbarButton from './MobileToolbarButton.svelte';
  import RubyModal from './RubyModal.svelte';

  const { state } = getEditorContext();
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

  $: currentColor =
    (editor?.getAttributes('font_color').fontColor as string | undefined)?.toUpperCase() ?? values.defaultColor;
</script>

<div
  class={flex({ direction: 'column', color: 'gray.800', backgroundColor: 'gray.0', hideFrom: 'sm' })}
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
        <Icon icon={IconText} size={24} />
      </MobileToolbarButton>

      <MobileToolbarButton
        on:click={() => {
          const picker = document.createElement('input');
          picker.type = 'file';
          picker.accept = validImageMimes.join(',');
          picker.multiple = true;
          picker.addEventListener('change', () => {
            if (picker.files?.length) {
              $state.fileHandler?.('image', [...picker.files]);
            }
          });
          picker.click();
        }}
      >
        <Icon icon={IconPhoto} size={24} />
      </MobileToolbarButton>

      <MobileToolbarButton on:click={() => (topMenu = 'insert')}>
        <Icon icon={IconPlus} size={24} />
      </MobileToolbarButton>

      <MobileToolbarButton on:click={() => toggleBottomMenu('horizontalRule')}>
        <Icon icon={IconHorizontalRule} size={24} />
      </MobileToolbarButton>

      <MobileToolbarButton on:click={() => (topMenu = 'options')}>
        <Icon icon={IconSettings} size={24} />
      </MobileToolbarButton>
    {:else}
      <MobileToolbarButton on:click={() => (topMenu = 'default')}>
        <Icon style={css.raw({ color: 'gray.400' })} icon={IconArrowLeft} size={24} />
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
            <Icon style={css.raw(editor?.isActive('bold') && { color: 'brand.400' })} icon={IconBold} size={24} />
          </MobileToolbarButton>

          <MobileToolbarButton on:click={() => editor?.chain().focus().toggleItalic().run()}>
            <Icon style={css.raw(editor?.isActive('italic') && { color: 'brand.400' })} icon={IconItalic} size={24} />
          </MobileToolbarButton>

          <MobileToolbarButton on:click={() => editor?.chain().focus().toggleStrike().run()}>
            <Icon
              style={css.raw(editor?.isActive('strike') && { color: 'brand.400' })}
              icon={IconStrikethrough}
              size={24}
            />
          </MobileToolbarButton>

          <MobileToolbarButton on:click={() => editor?.chain().focus().toggleUnderline().run()}>
            <Icon
              style={css.raw(editor?.isActive('underline') && { color: 'brand.400' })}
              icon={IconUnderline}
              size={24}
            />
          </MobileToolbarButton>

          <Menu style={css.raw({ size: '24px' })} as="div" menuStyle={css.raw({ border: 'none' })} placement="bottom">
            <MobileToolbarButton
              slot="value"
              aria-pressed={editor?.isActive('ruby') || open}
              disabled={editor?.state.selection.empty && !editor?.isActive('ruby')}
              let:open
            >
              <Icon icon={IconRuby} size={24} />
            </MobileToolbarButton>

            <RubyModal />
          </Menu>

          <MobileToolbarButton on:click={() => toggleSubMenu('textAlign')}>
            <Icon
              icon={values.textAlign.find(({ value }) => value === editor?.getAttributes('paragraph').textAlign)
                ?.icon ?? values.textAlign[0].icon}
              size={24}
            />
          </MobileToolbarButton>

          <MobileToolbarButton on:click={() => toggleSubMenu('lineHeight')}>
            <Icon icon={IconLineHeight} size={24} />
          </MobileToolbarButton>

          <MobileToolbarButton on:click={() => toggleSubMenu('letterSpacing')}>
            <Icon icon={IconLetterSpacing} size={24} />
          </MobileToolbarButton>
        {:else if topMenu === 'insert'}
          <MobileToolbarButton on:click={() => editor?.chain().focus().toggleBulletList().run()}>
            <Icon icon={IconList} size={24} />
          </MobileToolbarButton>

          <MobileToolbarButton on:click={() => editor?.chain().focus().toggleOrderedList().run()}>
            <Icon icon={IconListNumbers} size={24} />
          </MobileToolbarButton>

          <MobileToolbarButton on:click={() => toggleBottomMenu('quote')}>
            <Icon icon={IconQuote} size={24} />
          </MobileToolbarButton>

          <MobileToolbarButton
            on:click={() => {
              const picker = document.createElement('input');
              picker.type = 'file';
              picker.multiple = true;
              picker.addEventListener('change', () => {
                if (picker.files?.length) {
                  $state.fileHandler?.('file', [...picker.files]);
                }
              });
              picker.click();
            }}
          >
            <Icon icon={IconFolder} size={24} />
          </MobileToolbarButton>

          <Menu style={css.raw({ size: '24px' })} as="div" menuStyle={css.raw({ border: 'none' })} placement="bottom">
            <MobileToolbarButton slot="value" aria-pressed={editor?.isActive('link') || open} let:open>
              <Icon icon={IconLink} size={24} />
            </MobileToolbarButton>
            <LinkModal />
          </Menu>

          <MobileToolbarButton
            disabled={editor?.isActive('codeBlock')}
            on:click={() => editor?.chain().focus().setCodeBlock().run()}
          >
            <Icon icon={IconCode} size={24} />
          </MobileToolbarButton>

          <MobileToolbarButton
            disabled={editor?.isActive('html')}
            on:click={() => editor?.chain().focus().setHtml().run()}
          >
            <Icon icon={IconHtml} size={24} />
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
                  { color: color === '#FFFFFF' ? 'gray.900' : 'gray.0' },
                  currentColor.toUpperCase() !== color && { display: 'none' },
                )}
                icon={IconCheck}
                size={12}
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
                  color: 'brand.400',
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
                fontSize.value === (editor?.getAttributes('font_size').fontSize ?? 16) && { color: 'brand.400' },
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
                style={css.raw(editor?.isActive({ textAlign: textAlign.value }) && { color: 'brand.400' })}
                icon={textAlign.icon}
                size={24}
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
                editor?.isActive({ lineHeight: lineHeight.value }) && { color: 'brand.400' },
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
                editor?.isActive({ letterSpacing: letterSpacing.value }) && { color: 'brand.400' },
              )}
              on:click={() => editor?.chain().focus().setParagraphLetterSpacing(letterSpacing.value).run()}
            >
              {letterSpacing.label}
            </MobileToolbarButton>
          {/each}
        </div>
      {:else if subMenu === 'paragraphIndent'}
        <div class={flex({ gap: '20px' })}>
          {#each values.documentParagraphIndent as documentParagraphIndent (documentParagraphIndent.value)}
            <MobileToolbarButton
              class={css(
                { paddingX: '5px' },
                editor?.isActive({ documentParagraphIndent: documentParagraphIndent.value }) && { color: 'brand.400' },
              )}
              on:click={() => editor?.commands.setDocumentParagraphIndent(documentParagraphIndent.value)}
            >
              {documentParagraphIndent.label}
            </MobileToolbarButton>
          {/each}
        </div>
      {:else if subMenu === 'paragraphSpacing'}
        <div class={flex({ gap: '20px' })}>
          {#each values.documentParagraphSpacing as documentParagraphSpacing (documentParagraphSpacing.value)}
            <MobileToolbarButton
              class={css(
                { paddingX: '5px' },
                editor?.isActive({ documentParagraphSpacing: documentParagraphSpacing.value }) && {
                  color: 'brand.400',
                },
              )}
              on:click={() => editor?.commands.setDocumentParagraphSpacing(documentParagraphSpacing.value)}
            >
              {documentParagraphSpacing.label}
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
