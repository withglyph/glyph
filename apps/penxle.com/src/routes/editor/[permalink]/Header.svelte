<script lang="ts">
  import { Link } from '@penxle/ui';
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import { onMount } from 'svelte';
  import IconLetterSpacing from '~icons/effit/letter-spacing';
  import IconLineHeight from '~icons/effit/line-height';
  import IconRuby from '~icons/effit/ruby';
  import IconBold from '~icons/tabler/bold';
  import IconCheck from '~icons/tabler/check';
  import IconChevronDown from '~icons/tabler/chevron-down';
  import IconChevronLeft from '~icons/tabler/chevron-left';
  import IconDotsVertical from '~icons/tabler/dots-vertical';
  import IconFolder from '~icons/tabler/folder';
  import IconHtml from '~icons/tabler/html';
  import IconItalic from '~icons/tabler/italic';
  import IconLink from '~icons/tabler/link';
  import IconList from '~icons/tabler/list';
  import IconListNumbers from '~icons/tabler/list-numbers';
  import IconMinus from '~icons/tabler/minus';
  import IconPhoto from '~icons/tabler/photo';
  import IconQuote from '~icons/tabler/quote';
  import IconSettings from '~icons/tabler/settings';
  import IconStrikethrough from '~icons/tabler/strikethrough';
  import IconUnderline from '~icons/tabler/underline';
  import Wordmark from '$assets/icons/wordmark.svg?component';
  import { fragment, graphql } from '$glitch';
  import { Icon } from '$lib/components';
  import { Logo } from '$lib/components/branding';
  import ColorPicker from '$lib/components/ColorPicker.svelte';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { createFloatingActions, portal } from '$lib/svelte/actions';
  import { values } from '$lib/tiptap/values';
  import CharacterCountWidget from './CharacterCountWidget.svelte';
  import { getEditorContext } from './context';
  import DraftListModal from './DraftListModal.svelte';
  import MobileEditMenu from './MobileEditMenu.svelte';
  import PublishMenu from './PublishMenu.svelte';
  import RevisionListModal from './RevisionListModal.svelte';
  import ToolbarButtonTooltip from './ToolbarButtonTooltip.svelte';
  import type { EditorPage_Header_post, EditorPage_Header_query } from '$glitch';

  export { _post as $post, _query as $query };
  let _query: EditorPage_Header_query;
  let _post: EditorPage_Header_post;

  const { store, state, forceSave } = getEditorContext();
  $: editor = $state.editor;

  $: query = fragment(
    _query,
    graphql(`
      fragment EditorPage_Header_query on Query {
        me @_required {
          id

          spaces {
            id
            name
            slug
            visibility

            icon {
              id
              ...Image_image
            }
          }

          posts(state: DRAFT) {
            id
          }

          ...EditorPage_DraftListModal_user
          ...CreateSpaceModal_user
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
        state
        discloseStats
        hasPassword
        receiveFeedback
        receivePatronage
        receiveTagContribution
        protectContent
        visibility

        space {
          id
        }

        ...EditorPage_PublishMenu_post
        ...EditorPage_DraftListModal_post
        ...EditorPage_RevisionListModal_Post
      }
    `),
  );

  const menuOffset = 11;

  let fontColorOpen = false;
  let colorPickerOpen = false;

  let contentOptionsOpen = false;
  let paragraphIndentOpen = false;
  let paragraphSpacingOpen = false;

  let publishMenuOpen = false;
  let revisionListOpen = false;
  let draftListOpen = false;

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

  const { anchor: colorPickerAnchor, floating: colorPickerFloating } = createFloatingActions({
    placement: 'bottom-end',
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

<header style:transform={`translateY(${vvOffset ?? 0}px)`} class="w-full top-0 bg-white absolute z-100 transition">
  <div class="w-full flex items-center justify-between border-b border-gray-200 h-14 px-5 sm:pl-7">
    <Link class="flex items-center gap-2" href="/">
      <Logo class="square-6 <sm:hidden" />
      <Wordmark class="h-5.25 color-icon-primary <sm:hidden" />

      <Icon class="square-6 sm:hidden" icon={IconChevronLeft} />
    </Link>

    <div class="flex items-end justify-end flex-1">
      <div class="flex flex-col items-end text-right mr-3">
        <CharacterCountWidget {editor} />

        <span
          class={clsx(
            'transition',
            !$state.isRevising && $state.lastRevision?.kind === 'MANUAL_SAVE'
              ? 'text-10-sb text-teal-500'
              : 'text-10-r text-gray-400',
          )}
        >
          {#if $state.isRevising || !$state.lastRevision}
            {dayjs().formatAsTime()} 저장중
          {:else}
            {dayjs($state.lastRevision.updatedAt).formatAsTime()} 저장됨
          {/if}
        </span>
      </div>

      <div class="flex items-center border border-gray-200 rounded py-2.5 px-3.5 mr-2 leading-none! text-14-m">
        <button
          class="after:(content-empty border-r border-gray-300 h-4 ml-2) leading-none!"
          disabled={!$state.canRevise}
          type="button"
          on:click={() => forceSave()}
        >
          저장
        </button>

        <button
          class="text-14-sb text-gray-400 pl-2 leading-none!"
          disabled={$query.me.posts.length === 0}
          type="button"
          on:click={() => (draftListOpen = true)}
        >
          {$query.me.posts?.length ?? 0}
        </button>
      </div>

      <div class="w-fit" use:publishAnchor>
        <button
          class="bg-gray-950 text-white px-8 py-2.5 rounded text-14-m leading-none border border-gray-950 text-center whitespace-nowrap sm:mr-3"
          type="button"
          on:click={() => (publishMenuOpen = true)}
        >
          발행
        </button>
      </div>

      {#if publishMenuOpen}
        <div
          class="fixed inset-0 z-49 <sm:bg-black/50"
          role="button"
          tabindex="-1"
          on:click={() => (publishMenuOpen = false)}
          on:keypress={null}
          use:portal
        />
      {/if}

      <div class="fixed left-0 bottom-0 w-full z-50 sm:hidden" use:portal>
        <PublishMenu {$post} {$query} bind:open={publishMenuOpen} />
      </div>

      <div class="z-50 <sm:hidden" use:publishFloating>
        <PublishMenu {$post} {$query} bind:open={publishMenuOpen} />
      </div>

      <Menu class="flex center" offset={menuOffset} placement="bottom-end" rounded={false}>
        <div slot="value" class="h-9 flex center <sm:hidden">
          <Icon class="square-6" icon={IconDotsVertical} />
        </div>

        <MenuItem
          on:click={() => {
            revisionListOpen = true;
          }}
        >
          저장이력
        </MenuItem>

        <MenuItem external href={`/editor/${$post.permalink}/preview`} type="link">미리보기</MenuItem>
      </Menu>
    </div>
  </div>

  <div class="flex items-center border-b border-gray-200 h-14 px-6 <sm:hidden">
    <div class="flex items-center pointer-events-auto">
      <div class="flex center space-x-3 h-8.5 after:(content-empty border-r border-gray-300 h-4 mx-3)">
        <ToolbarButtonTooltip message="글자 색">
          <button
            class="flex items-center pl-4px pr-2px gap-1 h-8.5 rounded hover:bg-gray-100 aria-pressed:bg-gray-100"
            aria-pressed={colorPickerOpen}
            type="button"
            on:click={() => (colorPickerOpen = true)}
            use:colorPickerAnchor
          >
            <div style:color={currentColor} class="rounded-full square-4.5 bg-[currentColor]" />
            <Icon class={clsx('square-4.5 text-gray-300', fontColorOpen && 'rotate-180')} icon={IconChevronDown} />
          </button>

          {#if colorPickerOpen}
            <div
              class="fixed inset-0 z-51"
              role="button"
              tabindex="-1"
              on:click={() => (colorPickerOpen = false)}
              on:keypress={null}
              use:portal
            />
          {/if}

          <div class={clsx('z-52', !colorPickerOpen && 'hidden')} use:colorPickerFloating>
            <ColorPicker
              hex={currentColor}
              on:input={(event) => {
                const { hex } = event.detail;
                if (hex === values.defaultColor) {
                  editor?.chain().focus().unsetFontColor().run();
                } else {
                  editor?.chain().focus().setFontColor(hex).run();
                }
              }}
            />
          </div>
        </ToolbarButtonTooltip>

        <ToolbarButtonTooltip message="폰트">
          <Menu as="div" offset={menuOffset} placement="bottom" rounded={false}>
            <button
              slot="value"
              class="flex justify-between pl-4px pr-2px items-center gap-1 whitespace-nowrap h-8.5 rounded hover:bg-gray-100 w-36 aria-pressed:bg-gray-100"
              aria-pressed={open}
              type="button"
              let:open
            >
              <div>
                {values.fontFamily.find(({ value }) => editor?.getAttributes('font_family').fontFamily === value)
                  ?.label ?? values.fontFamily[0].label}
              </div>
              <Icon class={clsx('square-4.5 text-gray-300', open && 'rotate-180')} icon={IconChevronDown} />
            </button>

            {#each values.fontFamily as font (font.value)}
              <MenuItem
                class={clsx('flex items-center gap-2 justify-between')}
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
                  class={clsx('square-5 text-teal-500', !editor?.isActive({ fontFamily: font.value }) && 'invisible')}
                  icon={IconCheck}
                />
              </MenuItem>
            {/each}
          </Menu>
        </ToolbarButtonTooltip>

        <ToolbarButtonTooltip message="글자 크기">
          <Menu as="div" menuClass="max-h-78 overflow-y-auto" offset={menuOffset} placement="bottom" rounded={false}>
            <button
              slot="value"
              class="flex justify-between items-center pl-4px pr-2px gap-1 h-8.5 rounded hover:bg-gray-100 w-16 aria-pressed:bg-gray-100"
              aria-pressed={open}
              type="button"
              let:open
            >
              {values.fontSize.find(({ value }) => editor?.getAttributes('font_size').fontSize === value)?.label ??
                values.fontSize[4].label}
              <Icon class={clsx('square-4.5 text-gray-300', open && 'rotate-180')} icon={IconChevronDown} />
            </button>

            {#each values.fontSize as fontSize (fontSize.value)}
              <MenuItem
                class="flex items-center gap-2 justify-between"
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
                  class={clsx('square-5 text-teal-500', !editor?.isActive({ fontSize: fontSize.value }) && 'invisible')}
                  icon={IconCheck}
                />
              </MenuItem>
            {/each}
          </Menu>
        </ToolbarButtonTooltip>
      </div>

      <div class="flex center space-x-1 after:(content-empty border-r border-gray-300 h-4 mx-3)">
        <ToolbarButtonTooltip message="굵게">
          <button
            class="flex center square-8.5 hover:(bg-gray-100 rounded)"
            type="button"
            on:click={() => editor?.chain().focus().toggleBold().run()}
          >
            <Icon class={clsx('square-6', editor?.isActive('bold') && 'text-teal-500')} icon={IconBold} />
          </button>
        </ToolbarButtonTooltip>

        <ToolbarButtonTooltip message="기울임">
          <button
            class="flex center square-8.5 hover:(bg-gray-100 rounded)"
            type="button"
            on:click={() => editor?.chain().focus().toggleItalic().run()}
          >
            <Icon class={clsx('square-6', editor?.isActive('italic') && 'text-teal-500')} icon={IconItalic} />
          </button>
        </ToolbarButtonTooltip>

        <ToolbarButtonTooltip message="취소선">
          <button
            class="flex center square-8.5 hover:(bg-gray-100 rounded)"
            type="button"
            on:click={() => editor?.chain().focus().toggleStrike().run()}
          >
            <Icon class={clsx('square-6', editor?.isActive('strike') && 'text-teal-500')} icon={IconStrikethrough} />
          </button>
        </ToolbarButtonTooltip>

        <ToolbarButtonTooltip message="밑줄">
          <button
            class="flex center square-8.5 hover:(bg-gray-100 rounded)"
            type="button"
            on:click={() => editor?.chain().focus().toggleUnderline().run()}
          >
            <Icon class={clsx('square-6', editor?.isActive('underline') && 'text-teal-500')} icon={IconUnderline} />
          </button>
        </ToolbarButtonTooltip>

        <ToolbarButtonTooltip message="루비">
          <button
            class="flex center square-8.5 hover:(bg-gray-100 rounded)"
            disabled={editor?.isActive('ruby') || editor?.state.selection.empty}
            type="button"
            on:click={() => editor?.chain().focus().setRuby('').run()}
          >
            <Icon class="square-6" icon={IconRuby} />
          </button>
        </ToolbarButtonTooltip>
      </div>

      <div class="flex center space-x-1 after:(content-empty border-r border-gray-300 h-4 mx-3)">
        <ToolbarButtonTooltip message="정렬">
          <Menu as="div" offset={menuOffset} placement="bottom" rounded={false}>
            <button
              slot="value"
              class="flex center rounded square-8.5 hover:bg-gray-100 aria-pressed:bg-gray-100"
              aria-pressed={open}
              type="button"
              let:open
            >
              <Icon
                class="square-6"
                icon={values.textAlign.find(({ value }) => value === editor?.getAttributes('paragraph').textAlign)
                  ?.icon ?? values.textAlign[0].icon}
              />
            </button>

            {#each values.textAlign as textAlign (textAlign.value)}
              <button
                class="flex center square-8.5 hover:(bg-primary) aria-pressed:text-teal-500"
                aria-pressed={editor?.isActive({ textAlign: textAlign.value })}
                type="button"
                on:click={() => editor?.chain().focus().setParagraphTextAlign(textAlign.value).run()}
              >
                <Icon class="square-6" icon={textAlign.icon} />
              </button>
            {/each}
          </Menu>
        </ToolbarButtonTooltip>

        <ToolbarButtonTooltip message="행간">
          <Menu as="div" offset={menuOffset} placement="bottom" rounded={false}>
            <button
              slot="value"
              class="flex center square-8.5 rounded hover:bg-gray-100 aria-pressed:bg-gray-100"
              aria-pressed={open}
              type="button"
              let:open
            >
              <Icon class="square-6" icon={IconLineHeight} />
            </button>

            {#each values.lineHeight as lineHeight (lineHeight.value)}
              <MenuItem
                class="flex items-center gap-2 justify-between"
                on:click={() => {
                  editor?.chain().focus().setParagraphLineHeight(lineHeight.value).run();
                }}
              >
                {lineHeight.label}
                <Icon
                  class={clsx(
                    'square-5 text-teal-500',
                    !editor?.isActive({ lineHeight: lineHeight.value }) && 'invisible',
                  )}
                  icon={IconCheck}
                />
              </MenuItem>
            {/each}
          </Menu>
        </ToolbarButtonTooltip>

        <ToolbarButtonTooltip message="자간">
          <Menu as="div" offset={menuOffset} placement="bottom" rounded={false}>
            <button
              slot="value"
              class="flex center square-8.5 rounded hover:bg-gray-100 aria-pressed:bg-gray-100"
              aria-pressed={open}
              type="button"
              let:open
            >
              <Icon class="square-6" icon={IconLetterSpacing} />
            </button>

            {#each values.letterSpacing as letterSpacing (letterSpacing.value)}
              <MenuItem
                class="flex items-center gap-2 justify-between"
                on:click={() => {
                  editor?.chain().focus().setParagraphLetterSpacing(letterSpacing.value).run();
                }}
              >
                {letterSpacing.label}
                <Icon
                  class={clsx(
                    'square-5 text-teal-500',
                    !editor?.isActive({ letterSpacing: letterSpacing.value }) && 'invisible',
                  )}
                  icon={IconCheck}
                />
              </MenuItem>
            {/each}
          </Menu>
        </ToolbarButtonTooltip>
      </div>

      <div class="flex center space-x-1 after:(content-empty border-r border-gray-300 h-4 mx-3)">
        <ToolbarButtonTooltip message="리스트">
          <Menu as="div" offset={menuOffset} placement="bottom" rounded={false}>
            <button
              slot="value"
              class="flex center square-8.5 rounded hover:bg-gray-100 aria-pressed:bg-gray-100"
              aria-pressed={open}
              type="button"
              let:open
            >
              <Icon class="square-6" icon={IconList} />
            </button>

            <MenuItem
              on:click={() => {
                editor?.chain().focus().toggleBulletList().run();
              }}
            >
              <Icon class="square-6" icon={IconList} />
            </MenuItem>

            <MenuItem
              on:click={() => {
                editor?.chain().focus().toggleOrderedList().run();
              }}
            >
              <Icon class="square-6" icon={IconListNumbers} />
            </MenuItem>
          </Menu>
        </ToolbarButtonTooltip>

        <ToolbarButtonTooltip message="구분선">
          <Menu as="div" offset={menuOffset} placement="bottom" rounded={false}>
            <button
              slot="value"
              class="flex center square-8.5 rounded hover:bg-gray-100 aria-pressed:bg-gray-100"
              aria-pressed={open}
              type="button"
              let:open
            >
              <Icon class="square-6" icon={IconMinus} />
            </button>

            {#each values.horizontalRule as hr (hr.value)}
              <MenuItem
                class="flex center gap-2 w-900px"
                on:click={() => {
                  editor?.chain().focus().setHorizontalRule(hr.value).run();
                }}
              >
                <hr class="w-11rem divider-preview" aria-label={`${hr.value}번째 구분선`} data-kind={hr.value} />
              </MenuItem>
            {/each}
          </Menu>
        </ToolbarButtonTooltip>

        <ToolbarButtonTooltip message="인용구">
          <Menu as="div" offset={menuOffset} placement="bottom" rounded={false}>
            <button
              slot="value"
              class="flex center square-8.5 rounded hover:bg-gray-100 aria-pressed:bg-gray-100"
              aria-pressed={open}
              type="button"
              let:open
            >
              <Icon class="square-6" icon={IconQuote} />
            </button>

            {#each values.blockquote as blockquote (blockquote.value)}
              <MenuItem
                class="flex center gap-2 w-900px"
                on:click={() => {
                  editor?.chain().focus().setBlockquote(blockquote.value).run();
                }}
              >
                <blockquote
                  class="blockquote-preview text-disabled"
                  aria-label={`${blockquote.value}번째 인용구`}
                  data-kind={blockquote.value}
                >
                  내용을 입력해주세요
                </blockquote>
              </MenuItem>
            {/each}
          </Menu>
        </ToolbarButtonTooltip>
      </div>

      <div class="flex center space-x-1 after:(content-empty border-r border-gray-300 h-4 mx-3)">
        <ToolbarButtonTooltip message="이미지">
          <button
            class="flex center square-8.5 hover:(bg-gray-100 rounded)"
            type="button"
            on:click={() => editor?.chain().focus().setGallery().run()}
          >
            <Icon class="square-6" icon={IconPhoto} />
          </button>
        </ToolbarButtonTooltip>

        <ToolbarButtonTooltip message="파일">
          <button class="flex center square-8.5 hover:(bg-gray-100 rounded)" type="button" on:click={handleInsertFile}>
            <Icon class="square-6" icon={IconFolder} />
          </button>
        </ToolbarButtonTooltip>

        <ToolbarButtonTooltip message="링크">
          <button
            class="flex center square-8.5 hover:(bg-gray-100 rounded)"
            disabled={editor?.isActive('link') || editor?.state.selection.empty}
            type="button"
            on:click={() => editor?.chain().focus().setLink('').run()}
          >
            <Icon class="square-6" icon={IconLink} />
          </button>
        </ToolbarButtonTooltip>

        <ToolbarButtonTooltip message="HTML">
          <button
            class="flex center square-8.5 hover:(bg-gray-100 rounded)"
            disabled={editor?.isActive('html')}
            type="button"
            on:click={() => editor?.chain().focus().setHtml().run()}
          >
            <Icon class="square-6" icon={IconHtml} />
          </button>
        </ToolbarButtonTooltip>
      </div>

      <ToolbarButtonTooltip message="본문 설정">
        <Menu as="div" offset={menuOffset} placement="bottom" rounded={false} bind:open={contentOptionsOpen}>
          <button
            slot="value"
            class="flex center square-8.5 rounded hover:bg-gray-100 aria-pressed:bg-gray-100"
            aria-pressed={contentOptionsOpen}
            type="button"
          >
            <Icon class="square-6" icon={IconSettings} />
          </button>

          <Menu offset={16} placement="right-start" bind:open={paragraphIndentOpen}>
            <button
              slot="value"
              class="px-3.5 py-3 text-14-r w-full rounded-2 hover:(bg-teal-50 text-teal-600)"
              type="button"
              on:mouseenter={() => {
                paragraphIndentOpen = true;
                paragraphSpacingOpen = false;
              }}
            >
              문단 들여쓰기
            </button>

            <MenuItem
              class="flex items-center gap-2 justify-between"
              on:click={() => {
                contentOptionsOpen = false;
                paragraphIndentOpen = false;
                $store.paragraphIndent = 0;
              }}
            >
              없음
              <Icon
                class={clsx('square-5 text-teal-500', $store.paragraphIndent !== 0 && 'invisible')}
                icon={IconCheck}
              />
            </MenuItem>

            <MenuItem
              class="flex items-center gap-2 justify-between"
              on:click={() => {
                contentOptionsOpen = false;
                paragraphIndentOpen = false;
                paragraphIndentOpen = false;
                $store.paragraphIndent = 50;
              }}
            >
              0.5칸
              <Icon
                class={clsx('square-5 text-teal-500', $store.paragraphIndent !== 50 && 'invisible')}
                icon={IconCheck}
              />
            </MenuItem>

            <MenuItem
              class="flex items-center gap-2 justify-between"
              on:click={() => {
                contentOptionsOpen = false;
                paragraphIndentOpen = false;
                $store.paragraphIndent = 100;
              }}
            >
              1칸
              <Icon
                class={clsx('square-5 text-teal-500', $store.paragraphIndent !== 100 && 'invisible')}
                icon={IconCheck}
              />
            </MenuItem>

            <MenuItem
              class="flex items-center gap-2 justify-between"
              on:click={() => {
                contentOptionsOpen = false;
                paragraphIndentOpen = false;
                $store.paragraphIndent = 200;
              }}
            >
              2칸
              <Icon
                class={clsx('square-5 text-teal-500', $store.paragraphIndent !== 200 && 'invisible')}
                icon={IconCheck}
              />
            </MenuItem>
          </Menu>

          <Menu offset={16} placement="right-start" bind:open={paragraphSpacingOpen}>
            <button
              slot="value"
              class="px-3.5 py-3 text-14-r w-full rounded-2 hover:(bg-teal-50 text-teal-600)"
              type="button"
              on:mouseenter={() => {
                paragraphIndentOpen = false;
                paragraphSpacingOpen = true;
              }}
            >
              문단 사이간격
            </button>

            <MenuItem
              class="flex items-center gap-2 justify-between"
              on:click={() => {
                contentOptionsOpen = false;
                paragraphSpacingOpen = false;
                $store.paragraphSpacing = 0;
              }}
            >
              없음
              <Icon
                class={clsx('square-5 text-teal-500', $store.paragraphSpacing !== 0 && 'invisible')}
                icon={IconCheck}
              />
            </MenuItem>

            <MenuItem
              class="flex items-center gap-2 justify-between"
              on:click={() => {
                contentOptionsOpen = false;
                paragraphSpacingOpen = false;
                $store.paragraphSpacing = 50;
              }}
            >
              0.5줄
              <Icon
                class={clsx('square-5 text-teal-500', $store.paragraphSpacing !== 50 && 'invisible')}
                icon={IconCheck}
              />
            </MenuItem>

            <MenuItem
              class="flex items-center gap-2 justify-between"
              on:click={() => {
                contentOptionsOpen = false;
                paragraphSpacingOpen = false;
                $store.paragraphSpacing = 100;
              }}
            >
              1줄
              <Icon
                class={clsx('square-5 text-teal-500', $store.paragraphSpacing !== 100 && 'invisible')}
                icon={IconCheck}
              />
            </MenuItem>

            <MenuItem
              class="flex items-center gap-2 justify-between"
              on:click={() => {
                contentOptionsOpen = false;
                paragraphSpacingOpen = false;
                $store.paragraphSpacing = 200;
              }}
            >
              2줄
              <Icon
                class={clsx('square-5 text-teal-500', $store.paragraphSpacing !== 200 && 'invisible')}
                icon={IconCheck}
              />
            </MenuItem>
          </Menu>
        </Menu>
      </ToolbarButtonTooltip>
    </div>
  </div>

  <MobileEditMenu />
</header>

<DraftListModal {$post} $user={$query.me} bind:open={draftListOpen} />
<RevisionListModal {$post} bind:open={revisionListOpen} />

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
      border-top: solid 1px currentColor;
    }

    &[data-kind='3'] {
      width: 7.5rem;
    }

    &[data-kind='4'] {
      --uno: h-1.5rem;
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
    --uno: border-l-0.1875rem border-text-primary pl-0.625rem my-0.34375rem;

    &[data-kind='2'] {
      --uno: border-l-none;
      &:before {
        --uno: block w-2rem;
        content: url(https://pencil.so/blockquotes/carbon.svg);
      }
    }

    &[data-kind='3'] {
      --uno: border-l-none;
      &:before {
        --uno: block w-2rem m-x-auto;
        content: url(https://pencil.so/blockquotes/carbon.svg);
      }
      &:after {
        --uno: block w-2rem rotate-180 m-x-auto;
        content: url(https://pencil.so/blockquotes/carbon.svg);
      }
    }
  }
</style>
