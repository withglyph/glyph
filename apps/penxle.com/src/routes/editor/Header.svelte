<script lang="ts">
  import { computePosition, flip, offset, shift } from '@floating-ui/dom';
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import * as R from 'radash';
  import { tick } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { fragment, graphql } from '$glitch';
  import { Button, Image, ToggleButton, Tooltip } from '$lib/components';
  import { Logo } from '$lib/components/branding';
  import { Checkbox, Switch } from '$lib/components/forms';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { createMutationForm } from '$lib/form';
  import { portal } from '$lib/svelte/actions';
  import { UpdatePostOptionsInputSchema } from '$lib/validations/post';
  import ArticleCharacterCount from './ArticleCharacterCount.svelte';
  import CreateSpaceModal from './CreateSpaceModal.svelte';
  import ToolbarButton from './ToolbarButton.svelte';
  import type { Editor, JSONContent } from '@tiptap/core';
  import type {
    ContentFilterCategory,
    EditorPage_Header_post,
    EditorPage_Header_query,
    PostKind,
    PostRevisionKind,
  } from '$glitch';

  let _query: EditorPage_Header_query;
  let _post: EditorPage_Header_post | null = null;
  export { _post as $post, _query as $query };

  export let kind: PostKind;
  export let title: string;
  export let subtitle: string | null;
  export let content: JSONContent | undefined;
  export let editor: Editor | undefined;
  export let tags: string[];

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

            icon {
              id
              ...Image_image
            }
          }

          ...EditorPage_CreateSpaceModal_user
        }
      }
    `),
  );

  $: post = fragment(
    _post,
    graphql(`
      fragment EditorPage_Header_post on Post {
        id
        state
        contentFilters

        space {
          id
        }

        option {
          id
          discloseStats
          hasPassword
          receiveFeedback
          receivePatronage
          receiveTagContribution
          visibility
        }

        tags {
          id
          pinned

          tag {
            id
            name
          }
        }
      }
    `),
  );

  const revisePost = graphql(`
    mutation EditorPage_RevisePost_Mutation($input: RevisePostInput!) {
      revisePost(input: $input) {
        id
        permalink

        draftRevision {
          id
          createdAt
        }

        space {
          id
          slug
        }
      }
    }
  `);

  const { form, data, setInitialValues } = createMutationForm({
    mutation: graphql(`
      mutation EditorPage_UpdatePostOptions_Mutation($input: UpdatePostOptionsInput!) {
        updatePostOptions(input: $input) {
          id

          option {
            id
            discloseStats
            receiveFeedback
            receivePatronage
            receiveTagContribution
            visibility
          }

          tags {
            id
            pinned

            tag {
              id
              name
            }
          }
        }
      }
    `),
    schema: UpdatePostOptionsInputSchema,
    onSuccess: async () => {
      const resp = await doRevisePost('PUBLISHED');
      await goto(`/${resp.space.slug}/${resp.permalink}`);
    },
  });

  const doRevisePost = async (revisionKind: PostRevisionKind) => {
    const resp = await revisePost({
      revisionKind,
      postId: $data.postId,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      spaceId: selectedSpace!.id,
      title,
      subtitle,
      content,
    });

    $data.postId = resp.id;
    permalink = resp.permalink;
    revisedAt = resp.draftRevision.createdAt;

    return resp;
  };

  const autoSave = R.debounce({ delay: 1000 }, async () => doRevisePost('AUTO_SAVE'));

  let publishButtonEl: HTMLDivElement;
  let publishMenuEl: HTMLDivElement;

  let publishMenuOpen = false;
  let createSpaceOpen = false;
  let spaceSelectorOpen = false;

  let enablePassword = false;
  let enableContentFilter = false;

  $: if ($post?.option.hasPassword) {
    enablePassword = true;
  }

  $: if ($post?.contentFilters.filter((v) => v !== 'ADULT').length ?? 0 > 0) {
    enableContentFilter = true;
  }

  $: $data.tags = tags;

  let permalink: string | undefined;
  let selectedSpace: (typeof $query.me.spaces)[number] | undefined;
  let revisedAt: string | undefined;

  $: if ($query && selectedSpace === undefined) {
    if ($post) {
      const id = $post.space.id;
      selectedSpace = $query.me.spaces.find((space) => space.id === id);
    } else {
      const slug = $page.url.searchParams.get('space');
      selectedSpace = (slug && $query.me.spaces.find((space) => space.slug === slug)) || $query.me.spaces[0];
    }
  }

  $: if ($post) {
    setInitialValues({
      postId: $post.id,
      contentFilters: $post.contentFilters,
      discloseStats: $post.option.discloseStats,
      receiveFeedback: $post.option.receiveFeedback,
      receivePatronage: $post.option.receivePatronage,
      receiveTagContribution: $post.option.receiveTagContribution,
      password: $post.option.hasPassword ? '' : undefined,
      tags: $post.tags.map(({ tag }) => tag.name),
      visibility: $post.option.visibility,
    });
  } else {
    setInitialValues({
      postId: undefined as unknown as string,
      contentFilters: [],
      discloseStats: true,
      receiveFeedback: true,
      receivePatronage: true,
      receiveTagContribution: true,
      tags: [],
      visibility: 'PUBLIC',
    });
  }

  $: published = $post?.state === 'PUBLISHED';
  $: canRevise = browser && selectedSpace && !!title && content?.content;

  $: reviseNotAvailableReason = (() => {
    if (!selectedSpace) {
      return '게시할 스페이스를 선택해주세요';
    }

    if (!title) {
      return '제목을 입력해주세요';
    }

    if (!content?.content) {
      return '내용을 입력해주세요';
    }

    return '';
  })();

  $: if (canRevise) {
    autoSave();
  }

  const update = async () => {
    await tick();

    const position = await computePosition(publishButtonEl, publishMenuEl, {
      placement: 'bottom-end',
      middleware: [offset(4), flip(), shift({ padding: 8 })],
    });

    Object.assign(publishMenuEl.style, {
      left: `${position.x}px`,
      top: `${position.y}px`,
    });
  };

  $: if (publishMenuOpen) {
    void update();
  }

  const checkContentFilter = (e: Event, contentFilter: ContentFilterCategory) => {
    const { checked } = e.target as HTMLInputElement;

    $data.contentFilters = checked
      ? [...$data.contentFilters, contentFilter]
      : $data.contentFilters.filter((v) => v !== contentFilter);
  };
</script>

<header class="sticky top-0 z-50 border-b border-secondary bg-white py-2 px-4 sm:px-7.5 h-15.25 flex center">
  <div class="w-full max-w-300 flex items-center gap-2">
    <Logo class="square-6" />

    <div
      class={clsx(
        "bg-surface-primary rounded-3xl h-10 w-fit grid relative grid-cols-2 before:(content-[''] absolute w-50% h-100% left-0 bg-gray-70 rounded-3xl transition-all)",
        kind === 'GALLERY' && 'before:left-50%',
      )}
    >
      <button
        class={clsx(
          'h-10 py-2 px-4 flex items-center gap-2 z-1',
          kind === 'ARTICLE' && 'first:(text-white transition-color) last:(text-gray-70 transition-color)',
          kind === 'GALLERY' && 'first:(text-gray-70 transition-color) last:(text-white transition-color)',
        )}
        type="button"
        on:click={() => (kind = 'ARTICLE')}
      >
        <i class="i-lc-file-text square-5" />
        <span class="body-14-b">글 모드</span>
      </button>
      <button
        class={clsx(
          'h-10 py-2 px-4 flex items-center gap-2 z-1',
          kind === 'ARTICLE' && 'first:(text-white transition) last:(text-gray-70 transition)',
          kind === 'GALLERY' && 'first:(text-gray-70 transition) last:(text-white transition)',
        )}
        type="button"
        on:click={() => (kind = 'GALLERY')}
      >
        <i class="i-lc-image square-5" />
        <span class="body-14-b">그림 모드</span>
      </button>
    </div>

    <div class="flex items-center gap-2">
      <ToolbarButton
        name="실행 취소"
        class="i-lc-undo-2 square-6!"
        enabled={editor?.can().undo()}
        on:click={() => editor?.chain().focus().undo().run()}
      />
      <ToolbarButton
        name="다시 실행"
        class="i-lc-redo-2 square-6!"
        enabled={editor?.can().redo()}
        on:click={() => editor?.chain().focus().redo().run()}
      />
    </div>

    <div class="flex grow justify-center relative">
      <button
        class="w-full max-w-92 h-10 px-4 py-2 bg-primary border border-secondary rounded-xl flex gap-2 items-center justify-between w-full relative"
        disabled={published}
        type="button"
        on:click={() => {
          if (selectedSpace) {
            spaceSelectorOpen = !spaceSelectorOpen;
          } else {
            createSpaceOpen = true;
          }
        }}
      >
        {#if selectedSpace}
          <i class="i-lc-menu square-6 text-disabled absolute" />

          <div class="flex grow center gap-2">
            <Image class="square-6 rounded-md" $image={selectedSpace.icon} />
            <span class="body-15-b">{selectedSpace.name}</span>
          </div>
        {:else}
          <i class="i-lc-plus square-6 text-disabled absolute" />

          <div class="flex grow center gap-2">
            <span class="body-15-b">눌러서 새 스페이스 만들기</span>
          </div>
        {/if}
      </button>

      {#if spaceSelectorOpen}
        <div
          class="fixed inset-0 z-49"
          role="button"
          tabindex="-1"
          on:click={() => (spaceSelectorOpen = false)}
          on:keypress={null}
          use:portal
        />

        <ul
          class="absolute z-50 top-12 w-full max-w-92 bg-cardprimary rounded-2xl shadow-[0_4px_16px_0_rgba(0,0,0,0.15)] py-4 px-3 space-y-3"
        >
          {#each $query.me.spaces as space (space.id)}
            <li>
              <button
                class="px-2 py-1 w-full rounded-xl hover:bg-primary"
                type="button"
                on:click={() => {
                  selectedSpace = space;
                  spaceSelectorOpen = false;
                }}
              >
                <div class="flex items-center gap-2">
                  <Image class="square-6 rounded-md" $image={space.icon} />
                  <span class="body-15-b">{space.name}</span>
                </div>
              </button>
            </li>
          {/each}

          <hr class="border-alphagray-10" />

          <Button
            class="body-13-b w-full justify-start!"
            size="xs"
            variant="text"
            on:click={() => (createSpaceOpen = true)}
          >
            <i class="i-lc-plus square-3.5 mr-1" />
            새로운 스페이스 추가하기
          </Button>
        </ul>
      {/if}
    </div>

    <div class="flex flex-col items-end text-right w-36.5">
      <ArticleCharacterCount {editor} />
      <span class="caption-12-m text-disabled">
        {#if revisedAt}
          {dayjs(revisedAt).formatAsTime()} 저장됨
        {:else}
          저장되지 않음
        {/if}
      </span>
    </div>

    <div class="flex">
      <Tooltip class="peer" enabled={!canRevise} message={reviseNotAvailableReason}>
        <Button
          class="body-15-b disabled:border! border-r-none rounded-r-none"
          color="tertiary"
          disabled={!canRevise}
          loading={$revisePost.inflight}
          size="lg"
          variant="outlined"
          on:click={() => doRevisePost('MANUAL_SAVE')}
        >
          임시저장
        </Button>
      </Tooltip>

      <Button
        class="text-blue-50 body-15-b rounded-l-none peer-[&:has(button:enabled)]:peer-hover:border-l-border-primary"
        color="tertiary"
        size="lg"
        variant="outlined"
      >
        0
      </Button>
    </div>

    <div bind:this={publishButtonEl} class="w-fit">
      <Tooltip enabled={!canRevise} message={reviseNotAvailableReason}>
        <Button disabled={!canRevise} size="lg" on:click={() => (publishMenuOpen = true)}>포스트 게시</Button>
      </Tooltip>
    </div>

    {#if publishMenuOpen}
      <div
        class="fixed inset-0 z-51"
        role="button"
        tabindex="-1"
        on:click={() => (publishMenuOpen = false)}
        on:keypress={null}
        use:portal
      />
    {/if}

    <div
      bind:this={publishMenuEl}
      class={clsx(
        'absolute z-52 bg-cardprimary rounded-lg px-1 space-y-1 shadow-[0_4px_16px_0_rgba(0,0,0,0.15)] flex flex-col py-2',
        !publishMenuOpen && 'hidden!',
      )}
      use:portal
    >
      <button
        class="square-6 flex center absolute top-6 right-6 p-0 rounded-full text-secondary hover:(bg-primary text-primary)"
        type="button"
        on:click={() => (publishMenuOpen = false)}
      >
        <i class="i-lc-x" />
      </button>

      <form class="px-3 pt-4 pb-3.5 space-y-4 w-163" use:form>
        <p class="title-20-b">포스트 게시 옵션</p>

        <div>
          <p class="text-secondary mb-3">공개범위</p>

          <fieldset class="flex gap-6">
            <div class="flex gap-1.5 items-center">
              <input id="public" name="visibility" class="square-4.5" type="radio" value="PUBLIC" />
              <label class="grow body-15-sb" for="public">전체 공개</label>
            </div>
            <div class="flex gap-1.5 items-center">
              <input id="space" name="visibility" class="square-4.5" type="radio" value="SPACE" />
              <label class="grow body-15-sb flex items-center gap-1" for="space">
                멤버 공개
                <Tooltip message="같은 스페이스의 멤버에게만 노출돼요" placement="top">
                  <i class="i-lc-help-circle square-4 text-secondary" />
                </Tooltip>
              </label>
            </div>
            <div class="flex gap-1.5 items-center">
              <input id="unlisted" name="visibility" class="square-4.5" type="radio" value="UNLISTED" />
              <label class="grow body-15-sb flex items-center gap-1" for="unlisted">
                링크 공개
                <Tooltip message="링크를 아는 사람에게만 노출돼요" placement="top">
                  <i class="i-lc-help-circle square-4 text-secondary" />
                </Tooltip>
              </label>
            </div>
          </fieldset>
        </div>

        <div class="flex gap-6 items-center h-10">
          <Checkbox
            class="body-15-sb"
            checked={enablePassword}
            on:change={() => {
              enablePassword = !enablePassword;
              if (!enablePassword) {
                $data.password = null;
              }
            }}
          >
            비밀글
          </Checkbox>

          <input
            name="password"
            class={clsx('bg-surface-primary rounded-xl px-3 py-1 body-15-sb h-10', !enablePassword && 'hidden')}
            placeholder="비밀번호 입력"
            type="text"
          />
        </div>

        <p class="text-secondary">종류 선택</p>

        <div class="flex items-center gap-1">
          <Checkbox class="body-15-sb" on:change={(e) => checkContentFilter(e, 'ADULT')}>성인물</Checkbox>
          <Tooltip message="성인 인증을 한 유저에게만 노출돼요" placement="top">
            <i class="i-lc-help-circle square-4 text-secondary" />
          </Tooltip>
        </div>

        <Checkbox
          class="body-15-sb"
          checked={enableContentFilter}
          on:change={() => {
            enableContentFilter = !enableContentFilter;
            $data.contentFilters = [];
          }}
        >
          민감한 요소
        </Checkbox>

        <div class={clsx('grid grid-cols-5 gap-2', !enableContentFilter && 'hidden')}>
          <ToggleButton size="lg" on:change={(e) => checkContentFilter(e, 'VIOLENCE')}>폭력성</ToggleButton>
          <ToggleButton size="lg" on:change={(e) => checkContentFilter(e, 'GROSSNESS')}>벌레/징그러움</ToggleButton>
          <ToggleButton size="lg" on:change={(e) => checkContentFilter(e, 'CRUELTY')}>잔인성</ToggleButton>
          <ToggleButton size="lg" on:change={(e) => checkContentFilter(e, 'HORROR')}>공포성</ToggleButton>
          <ToggleButton size="lg" on:change={(e) => checkContentFilter(e, 'GAMBLING')}>사행성</ToggleButton>
          <ToggleButton size="lg" on:change={(e) => checkContentFilter(e, 'CRIME')}>약물/범죄</ToggleButton>
          <ToggleButton size="lg" on:change={(e) => checkContentFilter(e, 'PHOBIA')}>정신질환/공포증</ToggleButton>
          <ToggleButton size="lg" on:change={(e) => checkContentFilter(e, 'TRAUMA')}>PTSD/트라우마</ToggleButton>
          <ToggleButton size="lg" on:change={(e) => checkContentFilter(e, 'INSULT')}>부적절한 언어</ToggleButton>
          <ToggleButton size="lg" on:change={(e) => checkContentFilter(e, 'OTHER')}>기타</ToggleButton>
        </div>

        <p class="text-secondary">세부 설정</p>

        <Switch
          name="receiveTagContribution"
          class="flex items-center justify-between"
          checked={$data.receiveTagContribution ?? true}
        >
          <div>
            <p class="body-16-b">게시물 태그 수정 및 등록</p>
            <p class="body-15-m text-secondary">다른 독자들이 게시물의 태그를 수정할 수 있어요</p>
          </div>
        </Switch>

        <Switch
          name="receiveFeedback"
          class="flex items-center justify-between"
          checked={$data.receiveFeedback ?? true}
        >
          <div>
            <p class="body-16-b">게시물 피드백</p>
            <p class="body-15-m text-secondary">가장 오래 머무른 구간, 밑줄, 이모지 등 피드백을 받아요</p>
          </div>
        </Switch>

        <Switch name="discloseStats" class="flex items-center justify-between" checked={$data.discloseStats ?? true}>
          <div>
            <p class="body-16-b">게시물 세부 통계 공개</p>
            <p class="body-15-m text-secondary">조회수, 좋아요 수를 다른 독자들에게 공개해요</p>
          </div>
        </Switch>

        <Switch
          name="receivePatronage"
          class="flex items-center justify-between"
          checked={$data.receivePatronage ?? true}
        >
          <div>
            <p class="body-16-b">게시물 창작자 후원</p>
            <p class="body-15-m text-secondary">다른 독자들이 게시물에 자유롭게 후원을 할 수 있도록 해요</p>
          </div>
        </Switch>

        <Button class="w-full" size="xl" type="submit">게시하기</Button>
      </form>
    </div>

    {#if selectedSpace && permalink}
      <Menu placement="bottom-end">
        <button slot="value" class="square-10 p-3 flex center" type="button">
          <i class="i-lc-more-vertical square-6" />
        </button>

        <MenuItem>저장이력</MenuItem>
        <MenuItem external href={`/${selectedSpace.slug}/preview/${permalink}`} type="link">미리보기</MenuItem>
      </Menu>
    {:else}
      <div class="square-10 p-3 flex center">
        <i class="i-lc-more-vertical square-6 text-gray-30" />
      </div>
    {/if}
  </div>
</header>

<CreateSpaceModal $user={$query.me} bind:open={createSpaceOpen} />
