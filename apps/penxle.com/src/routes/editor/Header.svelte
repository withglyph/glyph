<script lang="ts">
  import { flip, offset, shift } from '@floating-ui/dom';
  import { Link } from '@penxle/ui';
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import * as R from 'radash';
  import { onDestroy, onMount, tick } from 'svelte';
  import { browser, dev } from '$app/environment';
  import { beforeNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import Wordmark from '$assets/icons/wordmark.svg?component';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Tooltip } from '$lib/components';
  import { Logo } from '$lib/components/branding';
  import ColorPicker from '$lib/components/ColorPicker.svelte';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { portal } from '$lib/svelte/actions';
  import { createFloatingActions } from '$lib/svelte-floating-ui';
  import { values } from '$lib/tiptap/values';
  import { isValidImageFile, validImageMimes } from '$lib/utils';
  import ArticleCharacterCount from './ArticleCharacterCount.svelte';
  import DraftPostModal from './DraftPostModal.svelte';
  import PublishMenu from './PublishMenu.svelte';
  import RevisionListModal from './RevisionListModal.svelte';
  import { preventRevise } from './store';
  import ToolbarButtonTooltip from './ToolbarButtonTooltip.svelte';
  import type { Editor, JSONContent } from '@tiptap/core';
  import type { Writable } from 'svelte/store';
  import type { EditorPage_Header_post, EditorPage_Header_query, PostRevisionKind } from '$glitch';

  let _query: EditorPage_Header_query;
  let _post: EditorPage_Header_post | null = null;
  export { _post as $post, _query as $query };
  let draftPost: Awaited<ReturnType<typeof revisePost>> | null = null;

  export let autoSaveCount: Writable<number>;
  export let title: string;
  export let subtitle: string | null;
  export let content: JSONContent;
  export let editor: Editor | undefined;
  export let paragraphIndent: number;
  export let paragraphSpacing: number;

  let postId: string;
  let warnUnload = false;

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

          ...EditorPage_DraftPostModal_user
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
        contentFilters
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
        ...EditorPage_RevisionListModal_Post
      }
    `),
  );

  beforeNavigate(({ cancel, willUnload }) => {
    const message = '작성 중인 포스트가 있어요. 정말 나가시겠어요?';

    if (warnUnload) {
      if (dev) {
        return;
      }

      if ($autoSaveCount === 0) {
        return;
      }

      if (willUnload) {
        cancel();
        return;
      }

      if (!confirm(message)) {
        cancel();
        return;
      }
    }
  });

  onMount(() => {
    if (window.innerWidth < 800) {
      warnUnload = false;
    }
  });

  const revisePost = graphql(`
    mutation EditorPage_RevisePost_Mutation($input: RevisePostInput!) {
      revisePost(input: $input) {
        id
        permalink

        draftRevision {
          id
          kind
          createdAt
        }

        space {
          id
          slug
        }

        ...EditorPage_RevisionListModal_Post
      }
    }
  `);

  let reviseKind: PostRevisionKind | undefined;

  const doRevisePost = async (revisionKind: PostRevisionKind) => {
    if (!canRevise) return;
    if (!selectedSpaceId) throw new Error('selectedSpaceId 값이 비어 있습니다');

    const resp = await revisePost({
      revisionKind,
      contentKind: 'ARTICLE',
      postId,
      title,
      subtitle,
      content,
      paragraphIndent,
      paragraphSpacing,
    });

    mixpanel.track('post:revise', { postId: resp.id, revisionKind });

    postId = resp.id;

    revisedAt = resp.draftRevision?.createdAt;
    reviseKind = resp.draftRevision?.kind;
    // $data.revisionId = resp.draftRevision.id;

    draftPost = resp;

    return resp;
  };

  let revisedAt: string | undefined;
  let publishMenuOpen = false;
  let revisionListOpen = false;
  let draftListOpen = false;

  // let enablePassword = false;
  // let enableContentFilter = false;

  // $: if ($post?.hasPassword) {
  //   enablePassword = true;
  // }

  // $: if ($post?.contentFilters.filter((v) => v !== 'ADULT').length ?? 0 > 0) {
  //   enableContentFilter = true;
  // }

  let selectedSpaceId: string | undefined;

  $: slug = $page.url.searchParams.get('space');
  $: if ($query && !$post && !selectedSpaceId && $query.me.spaces.length > 0) {
    if (slug) {
      const space = $query.me.spaces.find((space) => space.slug === slug);
      if (!space) throw new Error('글을 작성하고자 하는 스페이스 정보를 찾지 못했어요');

      selectedSpaceId = space.id;
    } else {
      selectedSpaceId = $query.me.spaces[0].id;
    }
  }
  $: if ($post && !selectedSpaceId) {
    selectedSpaceId = $post?.space?.id;
  }

  $: selectedSpace = $query.me.spaces.find((space) => space.id === selectedSpaceId);

  $: permalink = ($post || draftPost)?.permalink;

  $: if ($post) {
    postId = $post.id;
  }

  $: canRevise = browser && !!selectedSpaceId && !$preventRevise;
  // $: canPublish = canRevise && title.trim().length > 0;

  $: if (canRevise) {
    warnUnload = true;
  }

  const autoSave = R.debounce({ delay: 1000 }, async () => doRevisePost('AUTO_SAVE'));
  const unsubscriber = autoSaveCount.subscribe(() => {
    if (canRevise) {
      autoSave();
    }
  });

  onDestroy(unsubscriber);

  $: reviseNotAvailableReason = (() => {
    if (!title) {
      return '제목을 입력해주세요';
    }

    if (!content?.content) {
      return '내용을 입력해주세요';
    }

    return '';
  })();

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

  let menuOffset = 11;
  let tooltipOffset = 12;

  let linkInputEl: HTMLInputElement | null = null;

  let href = '';
  let linkButtonOpen = false;

  $: if (linkButtonOpen) {
    href = '';

    // eslint-disable-next-line unicorn/prefer-top-level-await
    void tick().then(() => {
      linkInputEl?.focus();
    });
  }

  let rubyText = '';
  let rubyButtonOpen = false;
  let hex = '#000000';

  $: if (rubyButtonOpen) {
    rubyText = '';
  }

  let fontColorOpen = false;
  let fontFamilyOpen = false;
  let fontSizeOpen = false;
  let postSettingOpen = false;
  let colorPickerOpen = false;

  const [floatingRef, floatingContent, update] = createFloatingActions({
    strategy: 'absolute',
    placement: 'bottom-end',
    middleware: [offset(18), flip(), shift({ padding: 8 })],
  });

  $: if (colorPickerOpen) {
    void update();
  }

  let paragraphIndentOpen = false;
  let paragraphSpacingOpen = false;
</script>

<header class="sticky top-0 z-50 bg-white <sm:hidden">
  <div class="w-full flex items-center justify-between border-b border-gray-200 h-14 pl-7 pr-5">
    <Link class="flex items-center gap-2" href="/">
      <Logo class="square-6" />
      <Wordmark class="h-5.25 color-icon-primary" />
    </Link>

    <div class="flex items-end justify-end flex-1">
      <div class="flex flex-col items-end text-right mr-3">
        <ArticleCharacterCount {editor} />

        {#if $revisePost.inflight}
          <span class="text-10-r text-gray-400">{dayjs(revisedAt).formatAsTime()} 저장중</span>
        {:else if revisedAt && reviseKind === 'AUTO_SAVE'}
          <span class="text-10-r text-gray-400">{dayjs(revisedAt).formatAsTime()} 저장됨</span>
        {:else if revisedAt && reviseKind === 'MANUAL_SAVE'}
          <span class="text-10-sb text-teal-500">{dayjs(revisedAt).formatAsTime()} 저장됨</span>
        {:else}
          <span class="text-10-r text-error-900">저장되지 않음</span>
        {/if}
      </div>

      <div class="flex items-center border border-gray-200 rounded py-2.5 px-3.5 mr-2 leading-none! text-14-m">
        <Tooltip enabled={!canRevise} message={reviseNotAvailableReason}>
          <button
            class="after:(content-empty border-r border-gray-300 h-4 ml-2) leading-none!"
            disabled={!canRevise}
            type="button"
            on:click={() => doRevisePost('MANUAL_SAVE')}
          >
            저장
          </button>
        </Tooltip>

        <button
          class="text-14-sb text-gray-400 pl-2 leading-none!"
          disabled={$query.me.posts.length === 0}
          type="button"
          on:click={() => (draftListOpen = true)}
        >
          {$query.me.posts?.length ?? 0}
        </button>
      </div>

      {#if $post}
        <PublishMenu
          {$post}
          {$query}
          {autoSaveCount}
          {content}
          {draftPost}
          {postId}
          {revisedAt}
          {subtitle}
          {title}
          {warnUnload}
          bind:paragraphIndent
          bind:paragraphSpacing
          bind:open={publishMenuOpen}
        />
      {/if}

      <Menu class="flex center" disabled={!permalink} offset={menuOffset} placement="bottom-end" rounded={false}>
        <div slot="value" class="h-9 flex center">
          <i class="i-tb-dots-vertical square-6" aria-label="더보기" />
        </div>

        <MenuItem
          on:click={() => {
            revisionListOpen = true;
          }}
        >
          저장이력
        </MenuItem>

        <MenuItem external href={`/${selectedSpace?.slug}/preview/${permalink}`} type="link">미리보기</MenuItem>
      </Menu>
    </div>
  </div>
  <div class="flex items-center border-b border-gray-200 h-14 px-6">
    <div class="flex items-center pointer-events-auto">
      <div class="flex center space-x-3 h-8.5 after:(content-empty border-r border-gray-300 h-4 mx-3)">
        <Tooltip class="flex center" message="글자 색" offset={tooltipOffset}>
          <button
            class="flex items-center gap-1 h-full hover:(bg-gray-100 rounded)"
            type="button"
            on:click={() => (colorPickerOpen = true)}
            use:floatingRef
          >
            <div
              style:color={editor?.getAttributes('font_color').fontColor ?? values.color[0].value}
              class="rounded-full square-4.5 bg-[currentColor]"
            />
            <i class={clsx('i-tb-chevron-down square-4.5 text-gray-300', fontColorOpen && 'rotate-180')} />
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

          <div class={clsx('z-52', !colorPickerOpen && 'hidden')} use:floatingContent use:portal>
            <ColorPicker
              onChange={() => {
                if (hex === values.color[0].value.toUpperCase()) {
                  editor?.chain().focus().unsetFontColor().run();
                } else {
                  editor?.chain().focus().setFontColor(hex).run();
                }
              }}
              bind:hex
            />
          </div>
        </Tooltip>

        <ToolbarButtonTooltip message="폰트">
          <Menu class="h-8.5" offset={menuOffset} placement="bottom-start" rounded={false} bind:open={fontFamilyOpen}>
            <div slot="value" class="flex items-center gap-1 whitespace-nowrap h-full hover:(bg-gray-100 rounded)">
              <div>
                {values.fontFamily.find(({ value }) => editor?.getAttributes('font_family').fontFamily === value)
                  ?.label ?? values.fontFamily[0].label}
              </div>
              <i class={clsx('i-tb-chevron-down square-4.5 text-gray-300', fontFamilyOpen && 'rotate-180')} />
            </div>

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
                <i
                  class={clsx(
                    'i-tb-check square-5 text-teal-500',
                    !editor?.isActive({ fontFamily: font.value }) && 'invisible',
                  )}
                  aria-hidden={!editor?.isActive({ fontFamily: font.value })}
                  aria-label="선택됨"
                />
              </MenuItem>
            {/each}
          </Menu>
        </ToolbarButtonTooltip>

        <ToolbarButtonTooltip message="글자 크기">
          <Menu
            class="flex items-center h-8.5"
            menuClass="max-h-60 overflow-y-auto"
            offset={menuOffset}
            placement="bottom-start"
            rounded={false}
            bind:open={fontSizeOpen}
          >
            <div slot="value" class="flex center gap-1 h-full hover:(bg-gray-100 rounded)">
              {values.fontSize.find(({ value }) => editor?.getAttributes('font_size').fontSize === value)?.label ??
                values.fontSize[4].label}
              <i class={clsx('i-tb-chevron-down square-4.5 text-gray-300', fontSizeOpen && 'rotate-180')} />
            </div>

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
                <i
                  class={clsx(
                    'i-tb-check square-5 text-teal-500',
                    !editor?.isActive({ fontSize: fontSize.value }) && 'invisible',
                  )}
                  aria-hidden={!editor?.isActive({ fontSize: fontSize.value })}
                  aria-label="선택됨"
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
            <i class={clsx('i-tb-bold square-6', editor?.isActive('bold') && 'text-teal-500')} />
          </button>
        </ToolbarButtonTooltip>

        <ToolbarButtonTooltip message="기울임">
          <button
            class="flex center square-8.5 hover:(bg-gray-100 rounded)"
            type="button"
            on:click={() => editor?.chain().focus().toggleItalic().run()}
          >
            <i class={clsx('i-tb-italic square-6', editor?.isActive('italic') && 'text-teal-500')} />
          </button>
        </ToolbarButtonTooltip>

        <ToolbarButtonTooltip message="취소선">
          <button
            class="flex center square-8.5 hover:(bg-gray-100 rounded)"
            type="button"
            on:click={() => editor?.chain().focus().toggleStrike().run()}
          >
            <i class={clsx('i-tb-strikethrough square-6', editor?.isActive('strike') && 'text-teal-500')} />
          </button>
        </ToolbarButtonTooltip>

        <ToolbarButtonTooltip message="밑줄">
          <button
            class="flex center square-8.5 hover:(bg-gray-100 rounded)"
            type="button"
            on:click={() => editor?.chain().focus().toggleUnderline().run()}
          >
            <i class={clsx('i-tb-underline square-6', editor?.isActive('underline') && 'text-teal-500')} />
          </button>
        </ToolbarButtonTooltip>

        <ToolbarButtonTooltip message="루비">
          <Menu
            class="flex center gap-2 square-8.5 hover:(bg-gray-100 rounded)"
            offset={menuOffset}
            padding={false}
            bind:open={rubyButtonOpen}
          >
            <i slot="value" class="i-px-ruby square-6" />

            <MenuItem type="div">
              <form
                class="flex relative gap-2 body-13-m text-secondary"
                on:submit|preventDefault={(event) => {
                  if (!(event.currentTarget.rubyText instanceof HTMLInputElement))
                    throw new Error('Fail to access input element');

                  const rubyText = event.currentTarget.rubyText.value.trim();
                  editor?.chain().focus().setRuby(rubyText).run();
                  // 메뉴 닫기
                  event.currentTarget.click();
                }}
              >
                <span class="invisible flex-grow min-w-8.25rem max-w-20rem text-clip overflow-hidden whitespace-nowrap">
                  {rubyText}
                </span>
                <input
                  name="rubyText"
                  class="absolute w-full max-w-20rem"
                  required
                  type="text"
                  on:click|stopPropagation
                  on:input={(event) => {
                    rubyText = event.currentTarget.value;
                  }}
                />
                <Tooltip message="적용하기">
                  <button class="hover:text-primary active:text-primary" type="submit" on:click|stopPropagation>
                    <i class="i-tb-check" />
                  </button>
                </Tooltip>
              </form>
            </MenuItem>
          </Menu>
        </ToolbarButtonTooltip>
      </div>

      <div class="flex center space-x-1 after:(content-empty border-r border-gray-300 h-4 mx-3)">
        <ToolbarButtonTooltip message="정렬">
          <Menu
            class="flex center gap-0.25rem square-8.5 hover:(bg-gray-100 rounded) hover:(bg-gray-100 rounded)"
            offset={menuOffset}
            placement="bottom-start"
            rounded={false}
          >
            <i
              slot="value"
              class={clsx(
                values.textAlign.find(({ value }) => value === editor?.getAttributes('paragraph').textAlign)?.icon ??
                  values.textAlign[0].icon,
                'square-6',
              )}
            />

            {#each values.textAlign as textAlign (textAlign.value)}
              <button
                class="flex center square-8.5 hover:(bg-primary) aria-pressed:text-teal-500"
                aria-pressed={editor?.isActive({ textAlign: textAlign.value })}
                type="button"
                on:click={() => editor?.chain().focus().setParagraphTextAlign(textAlign.value).run()}
              >
                <i class={clsx(textAlign.icon, 'square-6')} />
              </button>
            {/each}
          </Menu>
        </ToolbarButtonTooltip>

        <ToolbarButtonTooltip message="행간">
          <Menu
            class="flex center square-8.5 hover:(bg-gray-100 rounded)"
            offset={menuOffset}
            placement="bottom-start"
            rounded={false}
          >
            <i slot="value" class="i-px-line-height square-6" />

            {#each values.lineHeight as lineHeight (lineHeight.value)}
              <MenuItem
                class="flex items-center gap-2 justify-between"
                on:click={() => {
                  editor?.chain().focus().setParagraphLineHeight(lineHeight.value).run();
                }}
              >
                {lineHeight.label}
                <i
                  class={clsx(
                    'i-tb-check square-5 text-teal-500',
                    !editor?.isActive({ lineHeight: lineHeight.value }) && 'invisible',
                  )}
                  aria-hidden={!editor?.isActive({ lineHeight: lineHeight.value })}
                  aria-label="선택됨"
                />
              </MenuItem>
            {/each}
          </Menu>
        </ToolbarButtonTooltip>

        <ToolbarButtonTooltip message="자간">
          <Menu
            class="flex center square-8.5 body-14-m hover:(bg-gray-100 rounded)"
            offset={menuOffset}
            placement="bottom-start"
            rounded={false}
          >
            <i slot="value" class="i-px-letter-space square-6" />

            {#each values.letterSpacing as letterSpacing (letterSpacing.value)}
              <MenuItem
                class="flex items-center gap-2 justify-between"
                on:click={() => {
                  editor?.chain().focus().setParagraphLetterSpacing(letterSpacing.value).run();
                }}
              >
                {letterSpacing.label}
                <i
                  class={clsx(
                    'i-tb-check square-5 text-teal-500',
                    !editor?.isActive({ letterSpacing: letterSpacing.value }) && 'invisible',
                  )}
                  aria-hidden={!editor?.isActive({ letterSpacing: letterSpacing.value })}
                  aria-label="선택됨"
                />
              </MenuItem>
            {/each}
          </Menu>
        </ToolbarButtonTooltip>
      </div>

      <div class="flex center space-x-1 after:(content-empty border-r border-gray-300 h-4 mx-3)">
        <ToolbarButtonTooltip message="리스트">
          <Menu
            class="flex center square-8.5 body-14-m hover:(bg-gray-100 rounded)"
            offset={menuOffset}
            placement="bottom"
            rounded={false}
          >
            <i slot="value" class="i-tb-list square-6" />

            <MenuItem
              on:click={() => {
                editor?.chain().focus().toggleBulletList().run();
              }}
            >
              <i class="i-tb-list square-6" aria-label="순서 없는 리스트" />
            </MenuItem>

            <MenuItem
              on:click={() => {
                editor?.chain().focus().toggleOrderedList().run();
              }}
            >
              <i class="i-tb-list-numbers square-6" aria-label="번호 매겨진 리스트" />
            </MenuItem>
          </Menu>
        </ToolbarButtonTooltip>

        <ToolbarButtonTooltip message="구분선">
          <Menu
            class="flex center square-8.5 body-14-m hover:(bg-gray-100 rounded)"
            offset={menuOffset}
            placement="bottom"
            rounded={false}
          >
            <i slot="value" class="i-tb-minus square-6" />

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
          <Menu
            class="flex center square-8.5 body-14-m hover:(bg-gray-100 rounded)"
            as="button"
            offset={menuOffset}
            placement="bottom"
            rounded={false}
          >
            <i slot="value" class="i-tb-quote square-6" />

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
          <button class="flex center square-8.5 hover:(bg-gray-100 rounded)" type="button" on:click={handleInsertImage}>
            <i class="i-tb-photo square-6" />
          </button>
        </ToolbarButtonTooltip>

        <ToolbarButtonTooltip message="파일">
          <button class="flex center square-8.5 hover:(bg-gray-100 rounded)" type="button" on:click={handleInsertFile}>
            <i class="i-tb-folder square-6" />
          </button>
        </ToolbarButtonTooltip>

        <ToolbarButtonTooltip message="링크">
          <Menu
            class="flex center square-8.5 body-14-m hover:(bg-gray-100 rounded)"
            disabled={editor?.isActive('link')}
            offset={menuOffset}
            padding={false}
            bind:open={linkButtonOpen}
          >
            <i slot="value" class="i-tb-link square-6" />
            <MenuItem type="div">
              <form
                class="flex relative gap-2 body-13-m text-secondary"
                on:submit|preventDefault={(event) => {
                  if (!(event.currentTarget.url instanceof HTMLInputElement))
                    throw new Error('Fail to access input element');

                  const href = event.currentTarget.url.value;
                  editor?.chain().focus().setLink(href).run();
                  // 메뉴 닫기
                  event.currentTarget.click();
                }}
              >
                <span class="invisible flex-grow min-w-8.25rem max-w-20rem text-clip overflow-hidden whitespace-nowrap">
                  {href}
                </span>
                <input
                  bind:this={linkInputEl}
                  name="url"
                  class="absolute w-full max-w-20rem"
                  autocomplete="on"
                  placeholder="예) https://penxle.com"
                  required
                  type="url"
                  on:click|stopPropagation
                  on:input={(event) => {
                    href = event.currentTarget.value;
                  }}
                />
                <Tooltip message="적용하기">
                  <button class="hover:text-primary active:text-primary" type="submit" on:click|stopPropagation>
                    <i class="i-lc-check" />
                  </button>
                </Tooltip>
              </form>
            </MenuItem>
          </Menu>
        </ToolbarButtonTooltip>
      </div>

      <ToolbarButtonTooltip message="본문 설정">
        <Menu offset={menuOffset} placement="bottom-start" rounded={false} bind:open={postSettingOpen}>
          <div slot="value" class="flex center square-8.5">
            <i class="i-tb-settings square-6" />
          </div>

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
              on:click={() => {
                postSettingOpen = false;
                paragraphIndentOpen = false;
                paragraphIndentOpen = false;
                paragraphIndent = 50;
              }}
            >
              0.5줄
            </MenuItem>
            <MenuItem
              on:click={() => {
                postSettingOpen = false;
                paragraphIndentOpen = false;
                paragraphIndent = 100;
              }}
            >
              1줄
            </MenuItem>
            <MenuItem
              on:click={() => {
                postSettingOpen = false;
                paragraphIndentOpen = false;
                paragraphIndent = 200;
              }}
            >
              2줄
            </MenuItem>
            <MenuItem
              on:click={() => {
                postSettingOpen = false;
                paragraphIndentOpen = false;
                paragraphIndent = 0;
              }}
            >
              없음
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
              on:click={() => {
                postSettingOpen = false;
                paragraphSpacingOpen = false;
                paragraphSpacing = 50;
              }}
            >
              0.5줄
            </MenuItem>
            <MenuItem
              on:click={() => {
                postSettingOpen = false;
                paragraphSpacingOpen = false;
                paragraphSpacing = 100;
              }}
            >
              1줄
            </MenuItem>
            <MenuItem
              on:click={() => {
                postSettingOpen = false;
                paragraphSpacingOpen = false;
                paragraphSpacing = 200;
              }}
            >
              2줄
            </MenuItem>
            <MenuItem
              on:click={() => {
                postSettingOpen = false;
                paragraphSpacingOpen = false;
                paragraphSpacing = 0;
              }}
            >
              없음
            </MenuItem>
          </Menu>
        </Menu>
      </ToolbarButtonTooltip>
    </div>
  </div>
</header>

<DraftPostModal $user={$query.me} bind:open={draftListOpen} />

{#if $post}
  <RevisionListModal {$post} bind:open={revisionListOpen} />
{:else if draftPost}
  <RevisionListModal $post={draftPost} bind:open={revisionListOpen} />
{/if}

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
