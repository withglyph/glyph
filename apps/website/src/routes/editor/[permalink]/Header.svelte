<script lang="ts">
  import './toolbar-preview.css';

  import { onMount } from 'svelte';
  import IconHorizontalRule from '~icons/glyph/horizontal-rule';
  import IconLetterSpacing from '~icons/glyph/letter-spacing';
  import IconLineHeight from '~icons/glyph/line-height';
  import IconRuby from '~icons/glyph/ruby';
  import IconArrowBackUp from '~icons/tabler/arrow-back-up';
  import IconArrowForwardUp from '~icons/tabler/arrow-forward-up';
  import IconBold from '~icons/tabler/bold';
  import IconCheck from '~icons/tabler/check';
  import IconChevronDown from '~icons/tabler/chevron-down';
  import IconChevronLeft from '~icons/tabler/chevron-left';
  import IconClipboard from '~icons/tabler/clipboard';
  import IconClockPlay from '~icons/tabler/clock-play';
  import IconCode from '~icons/tabler/code';
  import IconFolder from '~icons/tabler/folder';
  import IconHtml from '~icons/tabler/html';
  import IconItalic from '~icons/tabler/italic';
  import IconLink from '~icons/tabler/link';
  import IconListNumbers from '~icons/tabler/list-numbers';
  import IconPhoto from '~icons/tabler/photo';
  import IconQuote from '~icons/tabler/quote';
  import IconSettings from '~icons/tabler/settings';
  import IconStrikethrough from '~icons/tabler/strikethrough';
  import IconUnderline from '~icons/tabler/underline';
  import FullLogo from '$assets/logos/full.svg?component';
  import { fragment, graphql } from '$bifrost';
  import { Alert, Icon } from '$lib/components';
  import ColorPicker from '$lib/components/ColorPicker.svelte';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { Button } from '$lib/components/v2';
  import { createFloatingActions, portal } from '$lib/svelte/actions';
  import { values } from '$lib/tiptap/values';
  import { css, cx } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import CharacterCountWidget from './CharacterCountWidget.svelte';
  import { getEditorContext } from './context';
  import DraftListModal from './DraftListModal.svelte';
  import FileUploadModal from './FileUploadModal.svelte';
  import MobileEditMenu from './MobileEditMenu.svelte';
  import PublishMenu from './PublishMenu.svelte';
  import ToolbarButton from './ToolbarButton.svelte';
  import ToolbarButtonTooltip from './ToolbarButtonTooltip.svelte';
  import type { EditorPage_Header_post, EditorPage_Header_query } from '$bifrost';

  export { _post as $post, _query as $query };
  let _query: EditorPage_Header_query;
  let _post: EditorPage_Header_post;

  const { state, forceSynchronize } = getEditorContext();
  $: editor = $state.editor;

  $: query = fragment(
    _query,
    graphql(`
      fragment EditorPage_Header_query on Query {
        me @_required {
          id

          posts(state: DRAFT) {
            id
          }

          ...EditorPage_DraftListModal_user
        }

        ...EditorPage_PublishMenu_query
      }
    `),
  );

  $: post = fragment(
    _post,
    graphql(`
      fragment EditorPage_Header_post on Post {
        id
        permalink

        ...EditorPage_PublishMenu_post
        ...EditorPage_DraftListModal_post
      }
    `),
  );

  const menuOffset = 4;

  let colorPickerOpen = false;

  let fileUploadModalOpen = false;

  let contentOptionsOpen = false;
  let paragraphIndentOpen = false;
  let paragraphSpacingOpen = false;

  let publishMenuOpen = false;
  let draftListOpen = false;
  let timeTravelOpen = false;

  const { anchor: colorPickerAnchor, floating: colorPickerFloating } = createFloatingActions({
    placement: 'bottom',
    offset: menuOffset,
  });

  const { anchor: publishAnchor, floating: publishFloating } = createFloatingActions({
    placement: 'bottom-end',
    offset: 11,
  });

  $: currentColor =
    (editor?.getAttributes('font_color').fontColor as string | undefined)?.toUpperCase() ?? values.defaultColor;

  let vvOffset: number | undefined;

  const handleVisualViewportChange = () => {
    vvOffset = window.visualViewport?.offsetTop;
  };

  onMount(() => {
    handleVisualViewportChange();

    window.visualViewport?.addEventListener('resize', handleVisualViewportChange);
    window.visualViewport?.addEventListener('scroll', handleVisualViewportChange);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleVisualViewportChange);
      window.visualViewport?.addEventListener('scroll', handleVisualViewportChange);
    };
  });
</script>

<header
  style:transform={`translateY(${vvOffset ?? 0}px)`}
  class={css({
    position: 'absolute',
    top: '0',
    width: 'full',
    backgroundColor: 'gray.5',
    transition: 'common',
    zIndex: '100',
  })}
>
  <div
    class={flex({
      justify: 'space-between',
      align: 'center',
      borderBottomWidth: '1px',
      borderBottomColor: 'gray.100',
      paddingX: '20px',
      width: 'full',
      height: { base: '56px', sm: '62px' },
    })}
  >
    <a class={flex({ align: 'center', gap: '8px' })} href="/">
      <FullLogo
        class={css({
          marginTop: '20px',
          marginBottom: '17px',
          color: 'gray.900',
          height: '25px',
          hideBelow: 'sm',
        })}
      />
      <Icon style={css.raw({ hideFrom: 'sm' })} icon={IconChevronLeft} size={24} />
    </a>

    <div class={flex({ flex: '1', justify: 'flex-end', align: 'flex-end' })}>
      {#if $state.timeTravel}
        <div class={flex({ gap: '10px' })} role="group">
          <Button size="sm" variant="brand-fill" on:click={() => (timeTravelOpen = true)}>이 시점으로 복구</Button>
          <Button size="sm" variant="gray-outline" on:click={() => ($state.timeTravel = false)}>시간여행 종료</Button>
        </div>
      {:else}
        <div
          class={flex({
            direction: 'column',
            marginRight: '8px',
            textAlign: 'right',
            fontSize: '12px',
            alignSelf: 'flex-start',
          })}
        >
          <CharacterCountWidget {editor} offset={8} placement="bottom-end" />
          <span
            class={css(
              { transition: 'common', fontSize: '12px' },
              $state.connectionState === 'connecting' || $state.connectionState === 'synchronizing'
                ? { color: 'gray.600' }
                : $state.connectionState === 'synchronized'
                  ? { fontWeight: 'medium', color: 'brand.400' }
                  : { fontWeight: 'bold', color: 'red.600' },
            )}
          >
            {#if $state.connectionState === 'connecting'}
              서버 연결 중
            {:else if $state.connectionState === 'synchronizing'}
              포스트 동기화 중
            {:else if $state.connectionState === 'synchronized'}
              실시간 저장 중
            {:else}
              서버 연결 끊김
            {/if}
          </span>
        </div>

        <div class={flex({ gap: '10px' })} role="group">
          <Button
            style={flex.raw({ alignItems: 'center', padding: '0!', backgroundColor: 'transparent!' })}
            role="presentation"
            size="sm"
            tabindex={-1}
            type="link"
            variant="gray-outline"
          >
            <button
              class={css({
                paddingLeft: '12px',
                paddingRight: '8px',
                paddingY: '9px',
                backgroundColor: { _hover: 'gray.100', _focusVisible: 'gray.100' },
              })}
              disabled={false}
              type="button"
              on:click={() => forceSynchronize()}
            >
              저장
            </button>
            <hr class={css({ width: '1px', height: '8px', backgroundColor: 'gray.300' })} />
            <button
              class={css({
                paddingLeft: '8px',
                paddingRight: '12px',
                paddingY: '9px',
                fontWeight: 'bold',
                color: 'gray.400',
                backgroundColor: { _hover: 'gray.100', _focusVisible: 'gray.100' },
              })}
              disabled={$query.me.posts.length === 0}
              type="button"
              on:click={() => (draftListOpen = true)}
            >
              {$query.me.posts?.length ?? 0}
            </button>
          </Button>

          <div class={css({ width: 'fit' })} use:publishAnchor>
            <Button
              style={css.raw({ width: '68px' })}
              aria-pressed={publishMenuOpen}
              size="sm"
              on:click={() => (publishMenuOpen = true)}
            >
              발행
            </Button>
          </div>
        </div>

        {#if publishMenuOpen}
          <div
            class={css({ position: 'fixed', inset: '0', zIndex: '40', smDown: { backgroundColor: 'gray.900/50' } })}
            role="button"
            tabindex="-1"
            on:click={() => (publishMenuOpen = false)}
            on:keypress={null}
            use:portal
          />
        {/if}

        <div
          class={css({ position: 'fixed', left: '0', bottom: '0', width: 'full', zIndex: '50', hideFrom: 'sm' })}
          use:portal
        >
          <PublishMenu {$post} {$query} bind:open={publishMenuOpen} />
        </div>

        <div class={css({ zIndex: '50', hideBelow: 'sm' })} use:publishFloating>
          <PublishMenu {$post} {$query} bind:open={publishMenuOpen} />
        </div>
      {/if}
    </div>
  </div>

  {#if !$state.timeTravel}
    <div
      class={flex({
        justify: 'space-between',
        marginX: 'auto',
        paddingY: '4px',
        width: 'full',
        maxWidth: '940px',
        hideBelow: 'sm',
      })}
    >
      <div class={flex({ align: 'center', gap: '8px' })}>
        <ToolbarButton
          icon={IconPhoto}
          label="이미지"
          size="lg"
          on:click={() => editor?.chain().focus().setGallery().run()}
        />
        <ToolbarButton icon={IconFolder} label="파일" size="lg" on:click={() => (fileUploadModalOpen = true)} />
        <ToolbarButton
          disabled={editor?.isActive('link') || editor?.state.selection.empty}
          icon={IconLink}
          label="링크"
          size="lg"
          on:click={() => editor?.chain().focus().setLink('').run()}
        />
        <ToolbarButton
          disabled={editor?.isActive('ruby') || editor?.state.selection.empty}
          icon={IconRuby}
          label="루비"
          size="lg"
          on:click={() => editor?.chain().focus().setRuby('').run()}
        />
        <Menu as="div" offset={menuOffset} placement="bottom">
          <ToolbarButton slot="value" aria-pressed={open} icon={IconHorizontalRule} label="구분선" size="lg" let:open />

          {#each values.horizontalRule as hr (hr.value)}
            <MenuItem
              style={center.raw({ gap: '8px' })}
              on:click={() => {
                editor?.chain().focus().setHorizontalRule(hr.value).run();
              }}
            >
              <hr
                class={cx('divider-preview', css({ width: '176px' }))}
                aria-label={`${hr.value}번째 구분선`}
                data-kind={hr.value}
              />
            </MenuItem>
          {/each}
        </Menu>

        <Menu as="div" offset={menuOffset} placement="bottom">
          <ToolbarButton slot="value" aria-pressed={open} icon={IconQuote} label="인용" size="lg" let:open />

          {#each values.blockquote as blockquote (blockquote.value)}
            <MenuItem
              style={center.raw({ gap: '8px' })}
              on:click={() => {
                editor?.chain().focus().setBlockquote(blockquote.value).run();
              }}
            >
              <blockquote
                class={cx('blockquote-preview', css({ color: 'gray.400', fontSize: '[12px!]' }))}
                aria-label={`${blockquote.value}번째 인용구`}
                data-kind={blockquote.value}
              >
                내용을 입력해주세요
              </blockquote>
            </MenuItem>
          {/each}
        </Menu>

        <Menu as="div" menuStyle={css.raw({ minWidth: '[initial]' })} offset={menuOffset} placement="bottom">
          <ToolbarButton slot="value" aria-pressed={open} icon={IconListNumbers} label="리스트" size="lg" let:open />

          {#each values.list as list (list.value)}
            <MenuItem
              style={css.raw({ _pressed: { color: 'brand.400' } })}
              aria-label={list.label}
              aria-pressed={editor?.isActive(list.value)}
              on:click={() => {
                editor?.chain().focus().toggleList(list.value, 'list_item').run();
              }}
            >
              <Icon icon={list.icon} size={24} />
            </MenuItem>
          {/each}
        </Menu>

        <ToolbarButton
          disabled={editor?.isActive('code_block')}
          icon={IconCode}
          label="코드블럭"
          size="lg"
          on:click={() => editor?.chain().focus().setCodeBlock().run()}
        />
        <ToolbarButton
          disabled={editor?.isActive('html')}
          icon={IconHtml}
          label="HTML블럭"
          size="lg"
          on:click={() => editor?.chain().focus().setHtml().run()}
        />
      </div>

      <div class={flex({ align: 'center', gap: '8px' })}>
        <ToolbarButton icon={IconClockPlay} label="시간여행" size="lg" on:click={() => ($state.timeTravel = true)} />
        <ToolbarButton
          style={css.raw({ _hover: { backgroundColor: 'gray.100' } })}
          external
          href={`/editor/${$post.permalink}/preview`}
          icon={IconClipboard}
          label="미리보기"
          size="lg"
          type="link"
        />
      </div>
    </div>

    <div
      class={css({
        borderYWidth: '1px',
        borderYColor: 'gray.100',
        hideBelow: 'sm',
      })}
    >
      <div
        class={flex({
          align: 'center',
          marginX: 'auto',
          paddingX: '8px',
          height: '44px',
          width: 'full',
          maxWidth: '940px',
        })}
      >
        <div class={flex({ align: 'center', color: 'gray.800', pointerEvents: 'auto' })}>
          <div class={center({ gap: '10px', height: '24px' })}>
            <ToolbarButtonTooltip message="실행 취소">
              <ToolbarButton
                disabled={!editor?.can().undo()}
                icon={IconArrowBackUp}
                on:click={() => editor?.chain().focus().undo().run()}
              />
            </ToolbarButtonTooltip>

            <ToolbarButtonTooltip message="다시 실행">
              <ToolbarButton
                disabled={!editor?.can().redo()}
                icon={IconArrowForwardUp}
                on:click={() => editor?.chain().focus().redo().run()}
              />
            </ToolbarButtonTooltip>
          </div>

          <hr
            class={css({ border: 'none', marginX: '8px', width: '1px', height: '12px', backgroundColor: 'gray.150' })}
          />

          <div class={center({ gap: '8px', height: '24px' })}>
            <ToolbarButtonTooltip message="글자 색">
              <button
                class={flex({
                  align: 'center',
                  gap: '2px',
                  paddingX: '4px',
                  height: '24px',
                  _hover: { backgroundColor: 'gray.100' },
                  _pressed: { backgroundColor: 'gray.100' },
                })}
                aria-pressed={colorPickerOpen}
                type="button"
                on:click={() => (colorPickerOpen = true)}
                use:colorPickerAnchor
              >
                <div style:background-color={currentColor} class={css({ borderRadius: 'full', size: '20px' })} />
                <Icon
                  style={css.raw({ color: 'gray.400' }, colorPickerOpen && { rotate: '[180deg]' })}
                  icon={IconChevronDown}
                />
              </button>

              {#if colorPickerOpen}
                <div
                  class={css({ position: 'fixed', inset: '0', zIndex: '40' })}
                  role="button"
                  tabindex="-1"
                  on:click={() => {
                    colorPickerOpen = false;
                    editor?.commands.focus();
                  }}
                  on:keypress={null}
                  use:portal
                />
              {/if}

              <div class={css({ zIndex: '50' })} use:colorPickerFloating>
                <ColorPicker
                  hex={currentColor}
                  bind:open={colorPickerOpen}
                  on:input={(event) => {
                    const { hex } = event.detail;
                    if (hex === values.defaultColor) {
                      editor?.commands.unsetFontColor();
                    } else {
                      editor?.commands.setFontColor(hex);
                    }
                  }}
                />
              </div>
            </ToolbarButtonTooltip>

            <ToolbarButtonTooltip message="폰트">
              <Menu as="div" offset={11} placement="bottom">
                <button
                  slot="value"
                  class={flex({
                    justify: 'space-between',
                    align: 'center',
                    gap: '2px',
                    marginRight: '2px',
                    paddingX: '4px',
                    fontSize: '14px',
                    fontWeight: 'medium',
                    color: 'gray.800',
                    width: '132px',
                    height: '24px',
                    whiteSpace: 'nowrap',
                    _hover: { backgroundColor: 'gray.100' },
                    _pressed: { backgroundColor: 'gray.100' },
                  })}
                  aria-pressed={open}
                  type="button"
                  let:open
                >
                  <div>
                    {values.fontFamily.find(({ value }) => editor?.getAttributes('font_family').fontFamily === value)
                      ?.label ?? values.fontFamily[0].label}
                  </div>
                  <Icon style={css.raw({ color: 'gray.400' }, open && { rotate: '[180deg]' })} icon={IconChevronDown} />
                </button>

                {#each values.fontFamily as font (font.value)}
                  <MenuItem
                    style={flex.raw({ justify: 'space-between', align: 'center', gap: '8px' })}
                    on:click={() => {
                      if (font.value === values.fontFamily[0].value) {
                        editor?.chain().focus().unsetFontFamily().run();
                      } else {
                        editor?.chain().focus().setFontFamily(font.value).run();
                      }
                    }}
                  >
                    <span style:font-family={`PNXL_${font.value}`}>
                      {font.label}
                    </span>
                    <Icon
                      style={css.raw(
                        { 'color': 'brand.400', '& *': { strokeWidth: '[2]' } },
                        !editor?.isActive({ fontFamily: font.value }) && { visibility: 'hidden' },
                      )}
                      icon={IconCheck}
                    />
                  </MenuItem>
                {/each}
              </Menu>
            </ToolbarButtonTooltip>

            <ToolbarButtonTooltip message="글자 크기">
              <Menu
                as="div"
                menuStyle={css.raw({ maxHeight: '312px', overflowY: 'auto' })}
                offset={11}
                placement="bottom"
              >
                <button
                  slot="value"
                  class={flex({
                    justify: 'space-between',
                    align: 'center',
                    gap: '2px',
                    paddingX: '4px',
                    fontSize: '14px',
                    fontWeight: 'medium',
                    width: '64px',
                    height: '24px',
                    _hover: { backgroundColor: 'gray.100' },
                    _pressed: { backgroundColor: 'gray.100' },
                  })}
                  aria-pressed={open}
                  type="button"
                  let:open
                >
                  {values.fontSize.find(({ value }) => editor?.getAttributes('font_size').fontSize === value)?.label ??
                    values.fontSize[4].label}
                  <Icon style={css.raw({ color: 'gray.400' }, open && { rotate: '[180deg]' })} icon={IconChevronDown} />
                </button>

                {#each values.fontSize as fontSize (fontSize.value)}
                  <MenuItem
                    style={flex.raw({ justify: 'space-between', align: 'center', gap: '8px' })}
                    on:click={() => {
                      if (!editor) return;

                      if (fontSize.value === 16) {
                        editor.chain().focus().unsetFontSize().run();
                      } else {
                        editor.chain().focus().setFontSize(fontSize.value).run();
                      }
                    }}
                  >
                    {fontSize.label}
                    <Icon
                      style={css.raw(
                        { 'color': 'brand.400', '& *': { strokeWidth: '[2]' } },
                        !editor?.isActive({ fontSize: fontSize.value }) && { visibility: 'hidden' },
                      )}
                      icon={IconCheck}
                    />
                  </MenuItem>
                {/each}
              </Menu>
            </ToolbarButtonTooltip>
          </div>

          <hr
            class={css({ border: 'none', marginX: '8px', width: '1px', height: '12px', backgroundColor: 'gray.150' })}
          />

          <div class={center({ gap: '6px' })}>
            <ToolbarButtonTooltip message="굵게">
              <ToolbarButton
                aria-pressed={editor?.isActive('bold')}
                icon={IconBold}
                on:click={() => editor?.chain().focus().toggleBold().run()}
              />
            </ToolbarButtonTooltip>

            <ToolbarButtonTooltip message="기울임">
              <ToolbarButton
                aria-pressed={editor?.isActive('italic')}
                icon={IconItalic}
                on:click={() => editor?.chain().focus().toggleItalic().run()}
              />
            </ToolbarButtonTooltip>

            <ToolbarButtonTooltip message="취소선">
              <ToolbarButton
                aria-pressed={editor?.isActive('strike')}
                icon={IconStrikethrough}
                on:click={() => editor?.chain().focus().toggleStrike().run()}
              />
            </ToolbarButtonTooltip>

            <ToolbarButtonTooltip message="밑줄">
              <ToolbarButton
                aria-pressed={editor?.isActive('underline')}
                icon={IconUnderline}
                on:click={() => editor?.chain().focus().toggleUnderline().run()}
              />
            </ToolbarButtonTooltip>
          </div>

          <hr
            class={css({ border: 'none', marginX: '8px', width: '1px', height: '12px', backgroundColor: 'gray.150' })}
          />

          <div class={center({ gap: '8px' })}>
            <ToolbarButtonTooltip message="정렬">
              <Menu as="div" menuStyle={css.raw({ minWidth: '[initial]' })} offset={11} placement="bottom">
                <ToolbarButton
                  slot="value"
                  aria-pressed={open}
                  icon={values.textAlign.find(({ value }) => value === editor?.getAttributes('paragraph').textAlign)
                    ?.icon ?? values.textAlign[0].icon}
                  let:open
                />

                {#each values.textAlign as textAlign (textAlign.value)}
                  <MenuItem
                    style={css.raw({ _pressed: { color: 'brand.400' } })}
                    aria-label={textAlign.label}
                    aria-pressed={editor?.isActive({ textAlign: textAlign.value })}
                    on:click={() => editor?.chain().focus().setParagraphTextAlign(textAlign.value).run()}
                  >
                    <Icon icon={textAlign.icon} size={24} />
                  </MenuItem>
                {/each}
              </Menu>
            </ToolbarButtonTooltip>

            <ToolbarButtonTooltip message="행간">
              <Menu as="div" offset={11} placement="bottom">
                <ToolbarButton slot="value" aria-pressed={open} icon={IconLineHeight} let:open />

                {#each values.lineHeight as lineHeight (lineHeight.value)}
                  <MenuItem
                    style={flex.raw({ justify: 'space-between', align: 'center', gap: '8px' })}
                    on:click={() => {
                      editor?.chain().focus().setParagraphLineHeight(lineHeight.value).run();
                    }}
                  >
                    {lineHeight.label}
                    <Icon
                      style={css.raw(
                        { 'color': 'brand.400', '& *': { strokeWidth: '[2]' } },
                        !editor?.isActive({ lineHeight: lineHeight.value }) && { visibility: 'hidden' },
                      )}
                      icon={IconCheck}
                    />
                  </MenuItem>
                {/each}
              </Menu>
            </ToolbarButtonTooltip>

            <ToolbarButtonTooltip message="자간">
              <Menu as="div" offset={11} placement="bottom">
                <ToolbarButton slot="value" aria-pressed={open} icon={IconLetterSpacing} let:open />

                {#each values.letterSpacing as letterSpacing (letterSpacing.value)}
                  <MenuItem
                    style={flex.raw({ justify: 'space-between', align: 'center', gap: '8px' })}
                    on:click={() => {
                      editor?.chain().focus().setParagraphLetterSpacing(letterSpacing.value).run();
                    }}
                  >
                    {letterSpacing.label}
                    <Icon
                      style={css.raw(
                        { 'color': 'brand.400', '& *': { strokeWidth: '[2]' } },
                        !editor?.isActive({ letterSpacing: letterSpacing.value }) && { visibility: 'hidden' },
                      )}
                      icon={IconCheck}
                    />
                  </MenuItem>
                {/each}
              </Menu>
            </ToolbarButtonTooltip>
          </div>

          <hr
            class={css({ border: 'none', marginX: '8px', width: '1px', height: '12px', backgroundColor: 'gray.150' })}
          />

          <ToolbarButtonTooltip message="본문 설정">
            <Menu as="div" offset={11} placement="bottom" bind:open={contentOptionsOpen}>
              <ToolbarButton slot="value" aria-pressed={open} icon={IconSettings} let:open />

              <Menu as="div" hideBackdrop offset={0} placement="right-start" bind:open={paragraphIndentOpen}>
                <MenuItem
                  slot="value"
                  data-hover={paragraphIndentOpen}
                  on:mouseenter={() => {
                    paragraphIndentOpen = true;
                    paragraphSpacingOpen = false;
                  }}
                >
                  문단 들여쓰기
                </MenuItem>

                {#each values.documentParagraphIndent as documentParagraphIndent (documentParagraphIndent.value)}
                  <MenuItem
                    style={flex.raw({ justify: 'space-between', align: 'center', gap: '8px' })}
                    on:click={() => {
                      contentOptionsOpen = false;
                      paragraphIndentOpen = false;
                      editor?.commands.setDocumentParagraphIndent(documentParagraphIndent.value);
                    }}
                  >
                    {documentParagraphIndent.label}
                    <Icon
                      style={css.raw(
                        { 'color': 'brand.400', '& *': { strokeWidth: '[2]' } },
                        !editor?.isActive({ documentParagraphIndent: documentParagraphIndent.value }) && {
                          visibility: 'hidden',
                        },
                      )}
                      icon={IconCheck}
                    />
                  </MenuItem>
                {/each}
              </Menu>

              <Menu as="div" hideBackdrop offset={0} placement="right-start" bind:open={paragraphSpacingOpen}>
                <MenuItem
                  slot="value"
                  data-hover={paragraphSpacingOpen}
                  on:mouseenter={() => {
                    paragraphIndentOpen = false;
                    paragraphSpacingOpen = true;
                  }}
                >
                  문단 사이간격
                </MenuItem>

                {#each values.documentParagraphSpacing as documentParagraphSpacing (documentParagraphSpacing.value)}
                  <MenuItem
                    style={flex.raw({ justify: 'space-between', align: 'center', gap: '8px' })}
                    on:click={() => {
                      contentOptionsOpen = false;
                      paragraphSpacingOpen = false;
                      editor?.commands.setDocumentParagraphSpacing(documentParagraphSpacing.value);
                    }}
                  >
                    {documentParagraphSpacing.label}
                    <Icon
                      style={css.raw(
                        { 'color': 'brand.400', '& *': { strokeWidth: '[2]' } },
                        !editor?.isActive({ documentParagraphSpacing: documentParagraphSpacing.value }) && {
                          visibility: 'hidden',
                        },
                      )}
                      icon={IconCheck}
                    />
                  </MenuItem>
                {/each}
              </Menu>
            </Menu>
          </ToolbarButtonTooltip>
        </div>
      </div>
    </div>
  {/if}

  <MobileEditMenu />
</header>

<FileUploadModal bind:open={fileUploadModalOpen} />
<DraftListModal {$post} $user={$query.me} bind:open={draftListOpen} />

<Alert bind:open={timeTravelOpen}>
  <p slot="title" class={css({ textAlign: 'left' })}>이 시점으로 돌아가시겠어요?</p>
  <p slot="content" class={css({ textAlign: 'left' })}>
    시간 여행은 몇 번이고 가능해요. 다시 시간여행을 하면 언제든 원하는 시점으로 돌아갈 수 있으니 안심하세요.
  </p>

  <svelte:fragment slot="action">
    <Button
      style={css.raw({ hideFrom: 'sm' })}
      size="lg"
      variant="gray-sub-fill"
      on:click={() => (timeTravelOpen = false)}
    >
      취소
    </Button>
    <Button
      style={css.raw({ hideBelow: 'sm' })}
      size="lg"
      variant="gray-outline"
      on:click={() => (timeTravelOpen = false)}
    >
      취소
    </Button>
    <Button
      size="lg"
      on:click={() => {
        $state.doTimeTravel?.();
        $state.timeTravel = false;
        timeTravelOpen = false;
      }}
    >
      복구
    </Button>
  </svelte:fragment>
</Alert>
