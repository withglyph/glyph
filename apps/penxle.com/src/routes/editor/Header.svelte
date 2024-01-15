<script lang="ts">
  import { flip, offset, shift } from '@floating-ui/dom';
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import * as R from 'radash';
  import { onDestroy, onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { browser, dev } from '$app/environment';
  import { beforeNavigate, goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Image, Modal, ToggleButton, Tooltip } from '$lib/components';
  import { Logo } from '$lib/components/branding';
  import { Checkbox, FormValidationMessage, Radio, Switch } from '$lib/components/forms';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { portal } from '$lib/svelte/actions';
  import { createFloatingActions } from '$lib/svelte-floating-ui';
  import { PublishPostInputSchema } from '$lib/validations/post';
  import CreateSpaceModal from '../(default)/CreateSpaceModal.svelte';
  import ArticleCharacterCount from './ArticleCharacterCount.svelte';
  import RevisionListModal from './RevisionListModal.svelte';
  import { preventRevise } from './store';
  import ToolbarButton from './ToolbarButton.svelte';
  import type { Editor, JSONContent } from '@tiptap/core';
  import type { ChangeEventHandler } from 'svelte/elements';
  import type { Writable } from 'svelte/store';
  import type {
    ContentFilterCategory,
    EditorPage_Header_post,
    EditorPage_Header_query,
    PostRevisionContentKind,
    PostRevisionKind,
  } from '$glitch';
  import type { ImageBounds } from '$lib/utils';
  import type { SwitchSpace } from './types/switch-space';

  let _query: EditorPage_Header_query;
  let _post: EditorPage_Header_post | null = null;
  export { _post as $post, _query as $query };
  let draftPost: Awaited<ReturnType<typeof revisePost>> | null = null;

  export let autoSaveCount: Writable<number>;
  export let kind: PostRevisionContentKind;
  export let title: string;
  export let subtitle: string | null;
  export let content: JSONContent;
  export let editor: Editor | undefined;
  export let tags: string[];
  export let thumbnailId: string | undefined;
  export let thumbnailBounds: ImageBounds | undefined;
  export let autoIndent: boolean;

  let postId: string | undefined;
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
            permalink

            draftRevision {
              id
              title
              updatedAt
            }
          }

          ...CreateSpaceModal_user
        }
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

        draftRevision {
          id

          tags {
            id
            name
          }
        }

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

  const deletePost = graphql(`
    mutation EditorPage_DeletePost_Mutation($input: DeletePostInput!) {
      deletePost(input: $input) {
        id
      }
    }
  `);

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

        ...EditorPage_RevisionListModal_Post
      }
    }
  `);

  const { form, data, setInitialValues } = createMutationForm({
    mutation: graphql(`
      mutation EditorPage_PublishPost_Mutation($input: PublishPostInput!) {
        publishPost(input: $input) {
          id
          permalink
          discloseStats
          receiveFeedback
          receivePatronage
          receiveTagContribution
          protectContent
          visibility

          space {
            id
            slug
          }
        }
      }
    `),
    schema: PublishPostInputSchema,
    extra: async () => {
      await doRevisePost('AUTO_SAVE');
      return {};
    },
    onSuccess: async (resp) => {
      warnUnload = false;
      mixpanel.track('post:publish', { postId: resp.id });
      await goto(`/${resp.space.slug}/${resp.permalink}`);
    },
  });

  const doRevisePost = async (revisionKind: PostRevisionKind) => {
    if (!canRevise) return;
    if (!selectedSpaceId) throw new Error('selectedSpaceId 값이 비어 있습니다');

    const resp = await revisePost({
      contentKind: kind,
      revisionKind,
      postId,
      spaceId: selectedSpaceId,
      tags,
      title,
      subtitle,
      content,
      thumbnailId,
      thumbnailBounds,
      autoIndent,
    });

    mixpanel.track('post:revise', { postId: resp.id, revisionKind });

    postId = resp.id;

    revisedAt = resp.draftRevision.createdAt;
    $data.revisionId = resp.draftRevision.id;

    draftPost = resp;

    return resp;
  };

  let revisedAt: string | undefined;
  let publishMenuOpen = false;
  let createSpaceOpen = false;
  let spaceSelectorOpen = false;
  let revisionListOpen = false;
  let draftListOpen = false;
  let deleteDraftPostOpen = false;
  let deletePostId: string | undefined;

  let enablePassword = false;
  let enableContentFilter = false;
  let changePassword = false;

  $: if ($post?.hasPassword) {
    enablePassword = true;
  }

  $: if ($post?.contentFilters.filter((v) => v !== 'ADULT').length ?? 0 > 0) {
    enableContentFilter = true;
  }

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
    selectedSpaceId = $post.space.id;
  }

  $: selectedSpace = $query.me.spaces.find((space) => space.id === selectedSpaceId);

  const switchSpace: SwitchSpace = ({ id, emitSave = false }) => {
    selectedSpaceId = id;
    spaceSelectorOpen = false;

    if (emitSave) {
      $autoSaveCount += 1;
    }
  };

  $: permalink = ($post || draftPost)?.permalink;

  $: if ($post) {
    setInitialValues({
      revisionId: $post.draftRevision?.id,
      contentFilters: $post.contentFilters,
      discloseStats: $post.discloseStats,
      receiveFeedback: $post.receiveFeedback,
      receivePatronage: $post.receivePatronage,
      receiveTagContribution: $post.receiveTagContribution,
      password: $post.hasPassword ? '' : undefined,
      protectContent: $post.protectContent,
      visibility: $post.visibility,
    });
  } else {
    setInitialValues({
      revisionId: '',
      contentFilters: [],
      discloseStats: true,
      receiveFeedback: true,
      receivePatronage: true,
      receiveTagContribution: true,
      protectContent: true,
      visibility: 'PUBLIC',
    });
  }

  $: if ($post) {
    postId = $post.id;
  }

  $: published = $post?.state === 'PUBLISHED';
  $: canRevise = browser && !!selectedSpaceId && !$preventRevise;
  $: canPublish = canRevise && title.trim().length > 0;

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

  const [floatingRef, floatingContent, update] = createFloatingActions({
    strategy: 'absolute',
    placement: 'bottom-end',
    middleware: [offset(4), flip(), shift({ padding: 8 })],
  });

  $: if (publishMenuOpen) {
    void update();
  }

  const checkContentFilter = (
    e: Parameters<ChangeEventHandler<HTMLInputElement>>[0],
    contentFilter: ContentFilterCategory,
  ) => {
    const { checked } = e.currentTarget;

    $data.contentFilters = checked
      ? $data.contentFilters
        ? [...$data.contentFilters, contentFilter]
        : [contentFilter]
      : $data.contentFilters?.filter((v) => v !== contentFilter);
  };

  const changeMode = (mode: PostRevisionContentKind) => {
    kind = mode;

    if (content?.content) {
      content.content = content.content.filter((c) => c.type === 'image' || c.type === 'access_barrier');
    }
  };
</script>

<header class="sticky top-0 z-50 border-b border-secondary bg-white py-2 px-4 sm:px-7.5 h-15.25 flex center <sm:hidden">
  <div class="w-full max-w-300 flex items-center gap-2">
    <Logo class="square-6" />

    <div
      class={clsx(
        "bg-surface-primary rounded-3xl h-10 w-fit grid relative grid-cols-2 before:(content-[''] absolute w-50% h-100% left-0 bg-gray-70 rounded-3xl transition-all)",
        kind === 'GALLERY' && 'before:left-50%',
      )}
    >
      <button
        class="h-10 py-2 px-4 flex items-center gap-2 z-1 text-gray-70 aria-pressed:text-white transition-color"
        aria-pressed={kind === 'ARTICLE'}
        disabled={kind === 'ARTICLE'}
        type="button"
        on:click={() => {
          changeMode('ARTICLE');
          $autoSaveCount += 1;
        }}
      >
        <i class="i-lc-file-text square-5" />
        <span class="body-14-b">글 모드</span>
      </button>
      <button
        class="h-10 py-2 px-4 flex items-center gap-2 z-1 text-gray-70 aria-pressed:text-white transition-color"
        aria-pressed={kind === 'GALLERY'}
        disabled={kind === 'GALLERY'}
        type="button"
        on:click={() => {
          const message = '그림 모드로 전환하면 그림을 제외한 나머지 내용은 사라져요. 그래도 전환하시겠어요?';

          if (confirm(message)) {
            changeMode('GALLERY');
            $autoSaveCount += 1;
          }
        }}
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
          {#if !published}
            <i class="i-lc-menu square-6 text-disabled absolute" />
          {/if}

          <div class="flex grow center gap-2">
            <Image class="square-6 rounded-md flex-none border border-secondary" $image={selectedSpace.icon} />
            <span class="body-15-b truncate">{selectedSpace.name}</span>
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
          transition:slide={{ axis: 'y', duration: 250 }}
        >
          {#each $query.me.spaces as space (space.id)}
            <li>
              <button
                class="px-2 py-1 w-full rounded-xl hover:bg-primary"
                type="button"
                on:click={() => {
                  switchSpace({ id: space.id, emitSave: true });
                }}
              >
                <div class="flex items-center gap-2">
                  <Image class="square-6 rounded-md flex-none border border-secondary" $image={space.icon} />
                  <span class="body-15-b truncate">{space.name}</span>
                </div>
              </button>
            </li>
          {/each}

          <hr class="border-alphagray-10" />

          <Button
            class="body-13-b w-full justify-start! truncate"
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

    <div class="flex flex-col items-end text-right">
      {#if kind === 'ARTICLE'}
        <ArticleCharacterCount {editor} />
      {:else}
        <div class="body-15-b w-fit">
          <mark class="text-blue-50">
            {content?.content?.filter((c) => c.type === 'image').length ?? 0}
          </mark>
          장
        </div>
      {/if}
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
        class={clsx(
          'text-blue-50 body-15-b rounded-l-none peer-[&:has(button:enabled)]:peer-hover:(border-l! border-l-border-primary)',
          $query.me.posts.length === 0 &&
            'border-l! peer-[&:has(button:enabled)]:peer-hover:(border-l-border-primary!)',
        )}
        color="tertiary"
        disabled={$query.me.posts.length === 0}
        size="lg"
        variant="outlined"
        on:click={() => (draftListOpen = true)}
      >
        {$query.me.posts?.length ?? 0}
      </Button>
    </div>

    <div class="w-fit" use:floatingRef>
      <Tooltip enabled={!canPublish} message={reviseNotAvailableReason}>
        <Button disabled={!canPublish} size="lg" on:click={() => (publishMenuOpen = true)}>포스트 게시</Button>
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
      class={clsx(
        'z-52 bg-cardprimary rounded-lg px-1 space-y-1 shadow-[0_4px_16px_0_rgba(0,0,0,0.15)] flex flex-col py-2',
        !publishMenuOpen && 'hidden!',
      )}
      use:floatingContent
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

        {#if selectedSpace?.visibility === 'PRIVATE'}
          <div class="bg-primary p-4 rounded-2xl flex items-center gap-2">
            <i class="i-px-alert-triangle color-action-red-primary square-4" />
            <p class="text-secondary body-13-b">
              현재 비공개 스페이스로 지정되어있어 스페이스 멤버 외에는 글을 볼 수 없어요
            </p>
          </div>
        {/if}

        <div>
          <p class="text-secondary mb-3">공개범위</p>

          <fieldset class="flex gap-6">
            <Radio name="visibility" class="gap-1.5 body-15-sb" value="PUBLIC">전체 공개</Radio>
            <Radio name="visibility" class="gap-1.5 body-15-sb" value="SPACE">
              멤버 공개
              <Tooltip message="같은 스페이스의 멤버에게만 노출돼요" placement="top">
                <i class="i-lc-help-circle square-4 text-secondary" />
              </Tooltip>
            </Radio>
            <Radio name="visibility" class="gap-1.5 body-15-sb" value="UNLISTED">
              링크 공개
              <Tooltip message="링크를 아는 사람에게만 노출돼요" placement="top">
                <i class="i-lc-help-circle square-4 text-secondary" />
              </Tooltip>
            </Radio>
          </fieldset>
        </div>

        <div class="flex items-center h-10">
          <Checkbox
            class="body-15-sb"
            checked={enablePassword}
            on:change={() => {
              enablePassword = !enablePassword;
              if (!enablePassword) {
                $data.password = null;
              }
              changePassword = true;
            }}
          >
            비밀글
          </Checkbox>

          {#if enablePassword && !changePassword && $post}
            <button
              class="body-15-sb text-disabled p-1 rounded-1 ml-1 hover:bg-primary"
              type="button"
              on:click={() => (changePassword = true)}
            >
              변경하기
            </button>
          {/if}

          <input
            name="password"
            class={clsx(
              'bg-surface-primary rounded-xl px-3 py-1 body-15-sb h-10 ml-6',
              (!enablePassword || ($post && enablePassword && !changePassword)) && 'hidden!',
            )}
            pattern="^[!-~]+$"
            placeholder="비밀번호 입력"
            type="text"
          />
          <FormValidationMessage for="password" let:message>
            <div class="flex items-center gap-1.5 text-xs text-red-50">
              <i class="i-lc-alert-triangle" />
              {message}
            </div>
          </FormValidationMessage>
        </div>

        <p class="text-secondary">종류 선택</p>

        <div class="flex items-center gap-1">
          <Checkbox
            class="body-15-sb"
            checked={$data.contentFilters?.includes('ADULT')}
            on:change={(e) => checkContentFilter(e, 'ADULT')}
          >
            성인물
          </Checkbox>
          <Tooltip message="성인 인증을 한 유저에게만 노출돼요" placement="top">
            <i class="i-lc-help-circle square-4 text-secondary" />
          </Tooltip>
        </div>

        <Checkbox
          class="body-15-sb"
          checked={enableContentFilter}
          on:change={() => {
            enableContentFilter = !enableContentFilter;
            $data.contentFilters = $data.contentFilters?.includes('ADULT') ? ['ADULT'] : [];
          }}
        >
          트리거 주의
        </Checkbox>

        <div class={clsx('grid grid-cols-5 gap-2', !enableContentFilter && 'hidden')}>
          <ToggleButton
            checked={$data.contentFilters?.includes('VIOLENCE')}
            size="lg"
            on:change={(e) => checkContentFilter(e, 'VIOLENCE')}
          >
            폭력성
          </ToggleButton>
          <ToggleButton
            checked={$data.contentFilters?.includes('GROSSNESS')}
            size="lg"
            on:change={(e) => checkContentFilter(e, 'GROSSNESS')}
          >
            벌레/징그러움
          </ToggleButton>
          <ToggleButton
            checked={$data.contentFilters?.includes('CRUELTY')}
            size="lg"
            on:change={(e) => checkContentFilter(e, 'CRUELTY')}
          >
            잔인성
          </ToggleButton>
          <ToggleButton
            checked={$data.contentFilters?.includes('HORROR')}
            size="lg"
            on:change={(e) => checkContentFilter(e, 'HORROR')}
          >
            공포성
          </ToggleButton>
          <ToggleButton
            checked={$data.contentFilters?.includes('GAMBLING')}
            size="lg"
            on:change={(e) => checkContentFilter(e, 'GAMBLING')}
          >
            사행성
          </ToggleButton>
          <ToggleButton
            checked={$data.contentFilters?.includes('CRIME')}
            size="lg"
            on:change={(e) => checkContentFilter(e, 'CRIME')}
          >
            약물/범죄
          </ToggleButton>
          <ToggleButton
            checked={$data.contentFilters?.includes('PHOBIA')}
            size="lg"
            on:change={(e) => checkContentFilter(e, 'PHOBIA')}
          >
            정신질환/공포증
          </ToggleButton>
          <ToggleButton
            checked={$data.contentFilters?.includes('TRAUMA')}
            size="lg"
            on:change={(e) => checkContentFilter(e, 'TRAUMA')}
          >
            PTSD/트라우마
          </ToggleButton>
          <ToggleButton
            checked={$data.contentFilters?.includes('INSULT')}
            size="lg"
            on:change={(e) => checkContentFilter(e, 'INSULT')}
          >
            부적절한 언어
          </ToggleButton>
          <ToggleButton
            checked={$data.contentFilters?.includes('OTHER')}
            size="lg"
            on:change={(e) => checkContentFilter(e, 'OTHER')}
          >
            기타
          </ToggleButton>
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

        <Switch name="protectContent" class="flex items-center justify-between" checked={$data.protectContent ?? true}>
          <div>
            <p class="body-16-b">게시물 내용 보호</p>
            <p class="body-15-m text-secondary">게시물의 내용을 우클릭하거나 복사할 수 없도록 해요</p>
          </div>
        </Switch>

        <Button class="w-full" size="xl" type="submit">게시하기</Button>
      </form>
    </div>

    <Menu class="p-3 flex center disabled:text-disabled" disabled={!permalink} placement="bottom-end">
      <i slot="value" class="i-lc-more-vertical square-6" aria-label="더보기" />
      <MenuItem
        class="body-14-m! text-primary!"
        on:click={() => {
          revisionListOpen = true;
        }}
      >
        저장이력
      </MenuItem>

      <MenuItem
        class="body-14-m! text-primary!"
        external
        href={`/${selectedSpace?.slug}/preview/${permalink}`}
        type="link"
      >
        미리보기
      </MenuItem>

      <hr class="border-alphagray-10" />

      <div class="flex items-center gap-2 body-14-m px-4 py-3 rounded-lg hover:bg-primary">
        <label class="cursor-pointer" for="autoIndent">문단 들여쓰기</label>
        <Checkbox name="autoIndent" bind:checked={autoIndent} on:change={() => ($autoSaveCount += 1)} />
      </div>
    </Menu>
  </div>
</header>

<CreateSpaceModal $user={$query.me} {switchSpace} bind:open={createSpaceOpen} />

{#if $post}
  <RevisionListModal {$post} bind:open={revisionListOpen} />
{:else if draftPost}
  <RevisionListModal $post={draftPost} bind:open={revisionListOpen} />
{/if}

<Modal bind:open={draftListOpen}>
  <svelte:fragment slot="title">임시저장된 글</svelte:fragment>
  <svelte:fragment slot="subtitle">{$query.me.posts?.length ?? 0}개의 포스트</svelte:fragment>

  <ul class="sm:(overflow-y-auto max-h-15rem)">
    {#each $query.me.posts as post (post.id)}
      <li class="py-3 border-t border-secondary flex items-center justify-between gap-2 [&>button]:hover:block">
        <button
          class="truncate w-full"
          type="button"
          on:click={async () => {
            draftListOpen = false;
            window.location.href = `/editor/${post.permalink}`;
          }}
        >
          <p class={clsx('body-16-b mb-1 truncate', post.draftRevision.title.trim().length === 0 && 'text-secondary')}>
            {post.draftRevision.title.trim().length === 0 ? '(제목 없음)' : post.draftRevision.title}
          </p>
          <time class="body-13-m text-secondary">{dayjs(post.draftRevision.updatedAt).formatAsDate()}</time>
        </button>
        <button
          class="i-lc-trash hidden square-5 color-text-disabled"
          type="button"
          on:click={() => {
            deleteDraftPostOpen = true;
            deletePostId = post.id;
          }}
        />
      </li>
    {/each}
  </ul>
</Modal>

<Modal size="sm" bind:open={deleteDraftPostOpen}>
  <svelte:fragment slot="title">임시저장글을 삭제할까요?</svelte:fragment>

  <div slot="action" class="flex gap-3 w-full">
    <Button class="w-full" color="secondary" size="xl" on:click={() => (deleteDraftPostOpen = false)}>닫기</Button>
    <Button
      class="w-full"
      size="xl"
      on:click={async () => {
        if (deletePostId) {
          if (postId === deletePostId) {
            await goto('/editor');
          }
          await deletePost({ postId: deletePostId });
          mixpanel.track('post:delete', { postId: deletePostId, via: 'editor' });
          toast.success('임시저장 포스트를 삭제했어요');
          deleteDraftPostOpen = false;
        }
      }}
    >
      삭제
    </Button>
  </div>
</Modal>
