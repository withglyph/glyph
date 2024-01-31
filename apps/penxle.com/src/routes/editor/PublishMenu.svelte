<script lang="ts">
  import { flip, offset, shift } from '@floating-ui/dom';
  import clsx from 'clsx';
  // import type { ChangeEventHandler } from 'svelte/elements';
  import { slide } from 'svelte/transition';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Image, ToggleButton, Tooltip } from '$lib/components';
  import { Checkbox, FormValidationMessage, Switch } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { portal } from '$lib/svelte/actions';
  import { createFloatingActions } from '$lib/svelte-floating-ui';
  import { PublishPostInputSchema } from '$lib/validations/post';
  import CreateSpaceModal from '../(default)/CreateSpaceModal.svelte';
  import PublishMenuRadioGroup from './PublishMenuRadioGroup.svelte';
  import { preventRevise } from './store';
  import type { JSONContent } from '@tiptap/core';
  import type { Writable } from 'svelte/store';
  import type {
    // ContentFilterCategory,
    EditorPage_PublishMenu_post,
    EditorPage_PublishMenu_query,
    PostRevisionContentKind,
    PostRevisionKind,
  } from '$glitch';
  import type { ImageBounds } from '$lib/utils';
  import type { SwitchSpace } from './types/switch-space';

  export let open = false;
  export let warnUnload = false;
  export let postId: string | undefined = undefined;
  export let revisedAt: string | undefined = undefined;
  export let draftPost: Awaited<ReturnType<typeof revisePost>> | null = null;

  export let autoSaveCount: Writable<number>;
  export let kind: PostRevisionContentKind;
  export let title: string;
  export let subtitle: string | null;
  export let content: JSONContent;
  export let tags: string[];
  export let thumbnailId: string | undefined;
  export let thumbnailBounds: ImageBounds | undefined;
  export let autoIndent: boolean;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { form, data, setInitialValues } = createMutationForm({
    mutation: graphql(`
      mutation EditorPage_PublishMenu_PublishPost_Mutation($input: PublishPostInput!) {
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

  let _post: EditorPage_PublishMenu_post | null;
  export { _post as $post };

  let _query: EditorPage_PublishMenu_query;
  export { _query as $query };

  $: canRevise = browser && !$preventRevise;
  $: canPublish = canRevise && title.trim().length > 0;

  $: query = fragment(
    _query,
    graphql(`
      fragment EditorPage_PublishMenu_query on Query {
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

            collections {
              id
              name

              thumbnail {
                id
                ...Image_image
              }
            }
          }

          posts(state: DRAFT) {
            id
          }

          ...EditorPage_DraftPostModal_user
          ...CreateSpaceModal_user
        }
      }
    `),
  );

  $: post = fragment(
    _post,
    graphql(`
      fragment EditorPage_PublishMenu_post on Post {
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

  const revisePost = graphql(`
    mutation EditorPage_PublishMenu_RevisePost_Mutation($input: RevisePostInput!) {
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

  const doRevisePost = async (revisionKind: PostRevisionKind) => {
    if (!canRevise) return;

    const resp = await revisePost({
      contentKind: kind,
      revisionKind,
      postId,
      spaceId: '', // TODO: 삭제
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
    // reviseKind = resp.draftRevision.
    // $data.revisionId = resp.draftRevision.id;

    draftPost = resp;

    return resp;
  };

  const [floatingRef, floatingContent, update] = createFloatingActions({
    strategy: 'absolute',
    placement: 'bottom-end',
    middleware: [offset(67), flip(), shift({ padding: 8 })],
  });

  $: if (open) {
    void update();
  }

  // const checkContentFilter = (
  //   e: Parameters<ChangeEventHandler<HTMLInputElement>>[0],
  //   contentFilter: ContentFilterCategory,
  // ) => {
  //   const { checked } = e.currentTarget;

  //   $data.contentFilters = checked
  //     ? $data.contentFilters
  //       ? [...$data.contentFilters, contentFilter]
  //       : [contentFilter]
  //     : $data.contentFilters?.filter((v) => v !== contentFilter);
  // };

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

  let enablePassword = false;
  // let enableContentFilter = false;
  let createSpaceOpen = false;

  $: if ($post?.hasPassword) {
    enablePassword = true;
  }

  // $: if ($post?.contentFilters.filter((v) => v !== 'ADULT').length ?? 0 > 0) {
  //   enableContentFilter = true;
  // }

  $: reviseNotAvailableReason = (() => {
    if (!title) {
      return '제목을 입력해주세요';
    }

    if (!content?.content) {
      return '내용을 입력해주세요';
    }

    return '';
  })();

  // let changePassword = false;
  // let spaceId: string | undefined = undefined;

  let selectedSpaceId: string | undefined = undefined;

  $: selectedSpace = $query.me.spaces.find((space) => space.id === selectedSpaceId);

  let spaceSelectorOpen = false;
  let collectionSelectorOpen = false;

  const switchSpace: SwitchSpace = ({ id, emitSave = false }) => {
    selectedSpaceId = id;
    spaceSelectorOpen = false;
    selectedCollection = undefined;

    if (emitSave) {
      $autoSaveCount += 1;
    }
  };

  let tabIndex = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let selectedCollection: any | undefined = undefined;
</script>

<div class="w-fit" use:floatingRef>
  <Tooltip enabled={!canPublish} message={reviseNotAvailableReason}>
    <button
      class="bg-gray-950 text-white px-3 py-2.5 rounded text-14-m mr-3 leading-none border border-gray-950"
      disabled={!canPublish}
      type="button"
      on:click={() => (open = true)}
    >
      포스트 게시
    </button>
  </Tooltip>
</div>

{#if open}
  <div
    class="fixed inset-0 z-51"
    role="button"
    tabindex="-1"
    on:click={() => (open = false)}
    on:keypress={null}
    use:portal
  />
{/if}

<div
  class={clsx(
    'bg-white shadow-[0px_5px_22px_0px_rgba(0,0,0,0.06)] border border-gray-200 border-t-none z-55 rounded-b-lg',
    !open && 'hidden!',
  )}
  use:floatingContent
  use:portal
>
  <div class="py-4 px-6 border-b border-gray-200">
    <p class="text-16-sb">게시 옵션</p>
    <span class="text-12-r text-gray-500 mt-0.5">다양한 옵션을 선택해 원하는 방식으로 게시글을 업로드할 수 있어요</span>
  </div>

  <div class="flex">
    <div class="w-52 py-2 flex flex-col border-r border-gray-200">
      <button class="px-2 py-0.5 text-13-sb" type="button" on:click={() => (tabIndex = 0)}>
        <span class="inline-block rounded py-2 px-1 hover:bg-gray-50 w-full">썸네일</span>
      </button>
      <button class="px-2 py-0.5 text-13-sb" type="button" on:click={() => (tabIndex = 1)}>
        <span class="inline-block rounded py-2 px-1 hover:bg-gray-50 w-full">스페이스/컬렉션</span>
      </button>
      <button class="px-2 py-0.5 text-13-sb" type="button" on:click={() => (tabIndex = 2)}>
        <span class="inline-block rounded py-2 px-1 hover:bg-gray-50 w-full">태그</span>
      </button>
      <button class="px-2 py-0.5 text-13-sb" type="button" on:click={() => (tabIndex = 3)}>
        <span class="inline-block rounded py-2 px-1 hover:bg-gray-50 w-full">범위설정</span>
      </button>
      <button class="px-2 py-0.5 text-13-sb" type="button" on:click={() => (tabIndex = 4)}>
        <span class="inline-block rounded py-2 px-1 hover:bg-gray-50 w-full">게시물 옵션</span>
      </button>
    </div>

    <div class="w-96 pt-5 px-6 h-108 overflow-y-auto">
      {#if tabIndex === 0}
        <p class="text-18-m mb-3">썸네일</p>

        <div class="flex items-center justify-between py-3 px-4 border border-dashed border-gray-200 rounded">
          <div class="flex items-center gap-1.5">
            <i class="i-tb-photo-up square-4.5 text-gray-300" />
            <span class="text-14-r">썸네일 이미지를 업로드해주세요</span>
          </div>

          <button class="text-11-sb text-white bg-teal-500 rounded-sm py-1 px-3" type="button">업로드</button>
        </div>

        <div class="border border-gray-200 px-4 py-3.5 rounded flex items-center justify-between">
          <div class="bg-#d9d9d9 square-15 rounded-sm" />

          <div class="flex items-center gap-1.5">
            <button type="button">
              <i class="i-tb-trash square-6" />
            </button>

            <button
              class="w-13.5 border border-gray-200 px-3 py-1 rounded-sm text-11-sb text-gray-400 text-center"
              type="button"
            >
              변경
            </button>
          </div>
        </div>
      {:else if tabIndex === 1}
        <p class="text-18-m mb-3">스페이스</p>

        <div class="py-2.5 px-4 mb-4 rounded-md relative bg-white border border-gray-200 hover:bg-gray-50">
          <button
            class="flex items-center justify-between w-full"
            type="button"
            on:click={() => (spaceSelectorOpen = true)}
          >
            {#if selectedSpace}
              <div class="flex items-center gap-1.5">
                <Image class="square-5.5 rounded-sm flex-none" $image={selectedSpace.icon} />
                <span class="text-12-r truncate">{selectedSpace.name}</span>
              </div>
            {:else}
              <span class="text-gray-500 text-13-r">스페이스를 선택해주세요</span>
            {/if}

            <p class="flex center square-6"><i class="i-tb-caret-up-filled square-3.5" /></p>
          </button>

          {#if spaceSelectorOpen}
            <div
              class="fixed inset-0 z-57"
              role="button"
              tabindex="-1"
              on:click={() => (spaceSelectorOpen = false)}
              on:keypress={null}
            />

            <ul
              class="absolute z-59 top-45px left-0 w-full rounded-b-md bg-white border border-gray-200"
              transition:slide={{ axis: 'y', duration: 250 }}
            >
              {#each $query.me.spaces as space (space.id)}
                <li class="border-b border-gray-200">
                  <button
                    class="px-4 py-3 w-full hover:(bg-teal-50 text-teal-700) flex justify-between items-center"
                    type="button"
                    on:click={() => {
                      switchSpace({ id: space.id, emitSave: true });
                    }}
                  >
                    <div class="flex items-center gap-1.5">
                      <Image class="square-5.5 rounded-sm flex-none" $image={space.icon} />
                      <span class="text-12-r truncate">{space.name}</span>
                    </div>

                    <div
                      class="text-center py-1 px-3 rounded-sm border text-11-sb border-gray-200 text-gray-400 w-13.5 hover:(text-white bg-teal-500)"
                    >
                      선택
                    </div>
                  </button>
                </li>
              {/each}
              <li>
                <button class="text-13-r px-4 py-3" type="button" on:click={() => (createSpaceOpen = true)}>
                  <i class="i-tb-plus square-3.5 m-1.5" />
                  새로운 스페이스 추가하기
                </button>
              </li>
            </ul>
          {/if}
        </div>

        <p class="text-18-m mb-3 pt-5">컬렉션</p>

        <div
          class="py-2.5 px-4 mb-4 rounded-md relative bg-white border border-gray-200 hover:bg-gray-50 has-[:disabled]:bg-gray-50"
        >
          <button
            class="flex items-center justify-between w-full"
            disabled={!selectedSpace}
            type="button"
            on:click={() => (collectionSelectorOpen = true)}
          >
            {#if selectedCollection}
              <div class="flex items-center gap-1.5">
                {#if selectedCollection.thumbnail}
                  <Image class="square-5.5 rounded-sm flex-none" $image={selectedCollection.thumbnail} />
                {/if}
                <span class="text-12-r truncate">{selectedCollection.name}</span>
              </div>
            {:else}
              <span class="text-gray-500 text-13-r">컬렉션을 선택해주세요</span>
            {/if}

            <p class="flex center square-6"><i class="i-tb-caret-up-filled square-3.5" /></p>
          </button>

          {#if collectionSelectorOpen && selectedSpace?.collections && selectedSpace.collections.length > 0}
            <div
              class="fixed inset-0 z-57"
              role="button"
              tabindex="-1"
              on:click={() => (collectionSelectorOpen = false)}
              on:keypress={null}
            />

            <ul
              class="absolute z-59 top-45px left-0 w-full rounded-b-md bg-white border border-gray-200"
              transition:slide={{ axis: 'y', duration: 250 }}
            >
              {#each selectedSpace?.collections as collection (collection.id)}
                <li class="border-b border-gray-200">
                  <button
                    class="px-4 py-3 w-full hover:(bg-teal-50 text-teal-700) flex justify-between items-center"
                    type="button"
                    on:click={() => {
                      selectedCollection = collection;
                      collectionSelectorOpen = false;
                    }}
                  >
                    <div class="flex items-center gap-1.5">
                      <span class="text-12-r truncate">{collection.name}</span>
                    </div>

                    <div
                      class="py-1 px-3 text-center rounded-sm border text-11-sb border-gray-200 text-gray-400 w-13.5 hover:(text-white bg-teal-500)"
                    >
                      선택
                    </div>
                  </button>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      {:else if tabIndex === 2}
        <div>
          <p class="text-18-m mb-3 flex gap-1.5">
            <span>카테고리</span>
            <Tooltip class="flex center" message="카테고리">
              <i class="i-tb-alert-circle square-3.5 text-gray-400" />
            </Tooltip>
          </p>

          <div class="grid grid-cols-4 gap-0.5625rem">
            <ToggleButton>오리지널</ToggleButton>
            <ToggleButton>2차창작</ToggleButton>
            <ToggleButton>비문학</ToggleButton>
            <ToggleButton>기타</ToggleButton>
          </div>
        </div>

        <div>
          <p class="text-18-m mb-3 flex gap-1.5 pt-5">
            <span>페어</span>
            <Tooltip class="flex center" message="페어">
              <i class="i-tb-alert-circle square-3.5 text-gray-400" />
            </Tooltip>
          </p>

          <div class="grid grid-cols-4 gap-0.5625rem">
            <ToggleButton>BL</ToggleButton>
            <ToggleButton>GL</ToggleButton>
            <ToggleButton>HL</ToggleButton>
            <ToggleButton>Non-CP</ToggleButton>
            <ToggleButton>그 외</ToggleButton>
          </div>
        </div>

        <div>
          <p class="text-18-m mb-3 flex gap-1.5 pt-5">
            <span>작품</span>
            <Tooltip class="flex center" message="작품">
              <i class="i-tb-alert-circle square-3.5 text-gray-400" />
            </Tooltip>
          </p>
        </div>

        <div>
          <p class="text-18-m mb-3 flex gap-1.5 pt-5">
            <span>캐릭터</span>
            <Tooltip class="flex center" message="캐릭터">
              <i class="i-tb-alert-circle square-3.5 text-gray-400" />
            </Tooltip>
          </p>
        </div>

        <div>
          <p class="text-18-m mb-3 flex gap-1.5 pt-5">
            <span>커플링</span>
            <Tooltip class="flex center" message="커플링">
              <i class="i-tb-alert-circle square-3.5 text-gray-400" />
            </Tooltip>
          </p>
        </div>

        <div>
          <p class="text-18-m mb-3 flex gap-1.5 pt-5">
            <span>트리거 주의</span>
            <Tooltip class="flex center" message="트리거 주의">
              <i class="i-tb-alert-circle square-3.5 text-gray-400" />
            </Tooltip>
          </p>
        </div>

        <div>
          <p class="text-18-m mb-3 flex gap-1.5 pt-5">
            <span>추가 태그</span>
            <Tooltip class="flex center" message="추가 태그">
              <i class="i-tb-alert-circle square-3.5 text-gray-400" />
            </Tooltip>
          </p>
        </div>
      {:else if tabIndex === 3}
        <div>
          <p class="text-18-m mb-3 flex gap-1.5">공개범위</p>
        </div>

        <PublishMenuRadioGroup
          name="visibility"
          items={[
            { label: '전체 공개', value: 'PUBLIC', icon: 'i-px-globe-outline' },
            { label: '링크 공개', value: 'UNLISTED', icon: 'i-tb-link' },
            { label: '멤버 공개', value: 'SPACE', icon: 'i-tb-users' },
          ]}
        />

        <div>
          <p class="text-18-m mb-3 flex gap-1.5 pt-5">
            <span>비밀글</span>
            <Tooltip class="flex center" message="비밀글">
              <i class="i-tb-alert-circle square-3.5 text-gray-400" />
            </Tooltip>
          </p>

          <Checkbox
            class="mb-3"
            on:change={() => {
              enablePassword = !enablePassword;
              if (!enablePassword) {
                $data.password = null;
              }
            }}
          >
            암호설정
          </Checkbox>

          <input
            name="password"
            class={clsx(
              'bg-gray-50 rounded px-4 py-3.5 text-14-r h-10 border border-gray-200 w-71.5',
              !enablePassword && 'hidden!',
            )}
            pattern="^[!-~]+$"
            placeholder="암호를 입력해주세요"
            type="text"
          />
          <FormValidationMessage for="password" let:message>
            <div class="flex items-center gap-1.5 text-xs text-red-50">
              <i class="i-lc-alert-triangle" />
              {message}
            </div>
          </FormValidationMessage>
        </div>

        <div>
          <p class="text-18-m mb-3 flex gap-1.5 pt-5">콘텐츠 등급</p>
        </div>

        <div>
          <p class="text-18-m mb-3 flex gap-1.5 pt-5">
            <span>검색 공개</span>
            <Tooltip class="flex center" message="검색 공개">
              <i class="i-tb-alert-circle square-3.5 text-gray-400" />
            </Tooltip>
          </p>
        </div>
      {:else if tabIndex === 4}
        <div class="space-y-4">
          <Switch
            name="receiveFeedback"
            class="flex items-center justify-between"
            checked={$data.receiveFeedback ?? true}
          >
            <div>
              <p class="text-14-m">피드백</p>
              <p class="text-11-r text-gray-700 mt-1">가장 오래 머무른 구간, 밑줄, 이모지 등 피드백을 받아요</p>
            </div>
          </Switch>

          <Switch name="discloseStats" class="flex items-center justify-between" checked={$data.discloseStats ?? true}>
            <div>
              <p class="text-14-m">게시물 세부 공개</p>
              <p class="text-11-r text-gray-700 mt-1">독자에게 좋아요, 조회수를 공유해요</p>
            </div>
          </Switch>

          <Switch
            name="receivePatronage"
            class="flex items-center justify-between"
            checked={$data.receivePatronage ?? true}
          >
            <div>
              <p class="text-14-m">창작자 후원</p>
              <p class="text-11-r text-gray-700 mt-1">독자들이 게시물에 자유롭게 후원할 수 있어요</p>
            </div>
          </Switch>

          <Switch
            name="protectContent"
            class="flex items-center justify-between"
            checked={$data.protectContent ?? true}
          >
            <div>
              <p class="text-14-m">게시물 내용 보호</p>
              <p class="text-11-r text-gray-700 mt-1">게시물의 내용을 보호하기 위해 우클릭 또는 복사를 제한해요</p>
            </div>
          </Switch>
        </div>
      {/if}
    </div>
  </div>

  <div class="text-right px-6 py-5 border-t border-gray-200">
    <button class="w-30 py-3 px-6 bg-gray-950 text-white text-14-m rounded-1.5 text-center" type="button">게시</button>
  </div>
</div>

<!-- <div
  class={clsx(
    'z-52 bg-cardprimary rounded-lg px-1 space-y-1 shadow-[0_4px_16px_0_rgba(0,0,0,0.15)] flex flex-col py-2',
    !open && 'hidden!',
  )}
  use:floatingContent
  use:portal
>
  <button
    class="square-6 flex center absolute top-6 right-6 p-0 rounded-full text-secondary hover:(bg-primary text-primary)"
    type="button"
    on:click={() => (open = false)}
  >
    <i class="i-lc-x" />
  </button>

  <form class="px-3 pt-4 pb-3.5 space-y-4 w-163" use:form>
    <p class="title-20-b">포스트 게시 옵션</p>

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

    <Switch name="receiveFeedback" class="flex items-center justify-between" checked={$data.receiveFeedback ?? true}>
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

    <Switch name="receivePatronage" class="flex items-center justify-between" checked={$data.receivePatronage ?? true}>
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
</div> -->

{#if $query}
  <CreateSpaceModal $user={$query.me} {switchSpace} bind:open={createSpaceOpen} />
{/if}
