<script lang="ts">
  import { flip, offset, shift } from '@floating-ui/dom';
  import clsx from 'clsx';
  // import * as R from 'radash';
  import { slide } from 'svelte/transition';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Image, SegmentButtonGroup, ToggleButton, Tooltip } from '$lib/components';
  import { Checkbox, FormValidationMessage, Switch } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { outsideClickEvent, portal } from '$lib/svelte/actions';
  import { createFloatingActions } from '$lib/svelte-floating-ui';
  import { PublishPostInputSchema } from '$lib/validations/post';
  import CreateSpaceModal from '../(default)/CreateSpaceModal.svelte';
  // import Chip from './Chip.svelte';
  import PublishMenuSearch from './PublishMenuSearch.svelte';
  import RadioGroup from './RadioGroup.svelte';
  import { preventRevise } from './store';
  import ThumbnailPicker from './ThumbnailPicker.svelte';
  import type { JSONContent } from '@tiptap/core';
  import type { ChangeEventHandler } from 'svelte/elements';
  import type { Writable } from 'svelte/store';
  import type { EditorPage_PublishMenu_post, EditorPage_PublishMenu_query, PostPair, PostRevisionKind } from '$glitch';
  import type { SwitchSpace } from './types/switch-space';

  export let open = false;
  export let warnUnload = false;
  export let postId: string;
  export let revisedAt: string | undefined = undefined;
  export let draftPost: Awaited<ReturnType<typeof revisePost>> | null = null;

  export let autoSaveCount: Writable<number>;
  export let title: string;
  export let subtitle: string | null;
  export let content: JSONContent;
  export let paragraphIndent: number;
  export let paragraphSpacing: number;

  const { form, data, setInitialValues, handleSubmit } = createMutationForm({
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

          space @_required {
            id
            slug
          }
        }
      }
    `),
    schema: PublishPostInputSchema,
    extra: async () => {
      await doRevisePost('AUTO_SAVE');
      return { spaceId: selectedSpaceId, collectionId: selectedCollectionId, thumbnailId };
    },
    onSuccess: async (resp) => {
      warnUnload = false;
      mixpanel.track('post:publish', { postId: resp.id });
      await goto(`/${resp.space.slug}/${resp.permalink}`);
    },
  });

  let _post: EditorPage_PublishMenu_post;
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
        category
        pairs
        externalSearchable

        space {
          id
        }

        tags {
          id
          kind

          tag {
            id
            name
          }
        }

        draftRevision @_required {
          id
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

        draftRevision @_required {
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
    $data.revisionId = resp.draftRevision.id;

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

  $: setInitialValues({
    revisionId: $post.draftRevision.id,
    spaceId: '',
    collectionId: undefined,
    thumbnailId: undefined,
    visibility: $post.visibility,
    password: $post.hasPassword ? '' : undefined,
    ageRating: 'ALL',
    externalSearchable: $post.externalSearchable,
    discloseStats: $post.discloseStats,
    receiveFeedback: $post.receiveFeedback,
    receivePatronage: $post.receivePatronage,
    receiveTagContribution: $post.receiveTagContribution,
    protectContent: $post.protectContent,
    category: $post.category,
    pairs: $post.pairs ?? [],
    tags: [],
  });

  let enablePassword = false;
  let createSpaceOpen = false;
  let titleSearchOpen = false;

  $: if ($post?.hasPassword) {
    enablePassword = true;
  }

  $: reviseNotAvailableReason = (() => {
    if (!title) {
      return '제목을 입력해주세요';
    }

    if (!content?.content) {
      return '내용을 입력해주세요';
    }

    return '';
  })();

  let selectedSpaceId: string | undefined = undefined;

  $: selectedSpace = $query.me.spaces.find((space) => space.id === selectedSpaceId);

  let spaceSelectorOpen = false;
  let collectionSelectorOpen = false;

  const switchSpace: SwitchSpace = ({ id, emitSave = false }) => {
    selectedSpaceId = id;
    selectedCollectionId = undefined;
    spaceSelectorOpen = false;

    $data.spaceId = selectedSpaceId;

    if (emitSave) {
      $autoSaveCount += 1;
    }
  };

  let tabIndex = 0;
  let selectedCollectionId: string | undefined = undefined;

  $: selectedCollection = selectedSpace?.collections.find((collection) => collection.id === selectedCollectionId);

  let titleQuery = '';
  let characterQuery = '';
  let couplingQuery = '';
  let triggerQuery = '';
  let otherTagQuery = '';

  let thumbnailPicker: ThumbnailPicker;
  let thumbnailId: string | undefined = undefined;

  // type Tag = {
  //   name: string;
  //   kind: string;
  // };

  const checkPair = (e: Parameters<ChangeEventHandler<HTMLInputElement>>[0], pair: PostPair) => {
    const { checked } = e.currentTarget;

    $data.pairs = checked ? ($data.pairs ? [...$data.pairs, pair] : [pair]) : $data.pairs?.filter((v) => v !== pair);
  };

  $: console.log($data);
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
    class="fixed inset-0 z-49"
    role="button"
    tabindex="-1"
    on:click={() => (open = false)}
    on:keypress={null}
    use:portal
  />
{/if}

<div
  class={clsx(
    'bg-white shadow-[0px_5px_22px_0px_rgba(0,0,0,0.06)] border border-gray-200 border-t-none z-50 rounded-b-lg',
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
    <div class="w-52 flex flex-col border-r border-gray-200 gap-1.5 py-1.5">
      <button
        class={clsx('mx-2 py-1 text-13-r flex items-center rounded hover:bg-gray-50', tabIndex === 0 && 'bg-gray-50')}
        type="button"
        on:click={() => (tabIndex = 0)}
      >
        {#if thumbnailId}
          <i class="i-px2-checkmark square-6 text-teal-500" />
        {:else}
          <i class="i-px2-checkmark square-6 text-gray-300" />
        {/if}
        <span class="py-2 px-1 w-full">썸네일</span>
      </button>
      <button
        class={clsx('mx-2 py-1 text-13-r flex items-center rounded hover:bg-gray-50', tabIndex === 1 && 'bg-gray-50')}
        type="button"
        on:click={() => (tabIndex = 1)}
      >
        {#if selectedSpaceId}
          <i class="i-px2-checkmark square-6 text-teal-500" />
        {:else}
          <i class="i-px2-dot square-6 text-pink-500" />
        {/if}
        <span class="py-2 px-1 w-full">스페이스/컬렉션</span>
      </button>
      <button
        class={clsx('mx-2 py-1 text-13-r flex items-center rounded hover:bg-gray-50', tabIndex === 2 && 'bg-gray-50')}
        type="button"
        on:click={() => (tabIndex = 2)}
      >
        <!-- 태그 설정했을 때 -->
        {#if true}
          <i class="i-px2-checkmark square-6 text-teal-500" />
        {:else}
          <i class="i-px2-checkmark square-6 text-gray-300" />
        {/if}
        <span class="py-2 px-1 w-full">태그</span>
      </button>
      <button
        class={clsx('mx-2 py-1 text-13-r flex items-center rounded hover:bg-gray-50', tabIndex === 3 && 'bg-gray-50')}
        type="button"
        on:click={() => (tabIndex = 3)}
      >
        <i class="i-px2-checkmark square-6 text-teal-500" />
        <span class="py-2 px-1 w-full">범위 설정</span>
      </button>
      <button
        class={clsx('mx-2 py-1 text-13-r flex items-center rounded hover:bg-gray-50', tabIndex === 4 && 'bg-gray-50')}
        type="button"
        on:click={() => (tabIndex = 4)}
      >
        <i class="i-px2-checkmark square-6 text-teal-500" />
        <span class="py-2 px-1 w-full">게시물 옵션</span>
      </button>
    </div>

    <form class="w-96 pt-5 px-6 h-108 overflow-y-auto" use:form>
      <input name="spaceId" type="hidden" bind:value={selectedSpaceId} />
      <input name="collectionId" type="hidden" bind:value={selectedCollectionId} />
      <input name="thumbnailId" type="hidden" bind:value={thumbnailId} />

      <div class={clsx('space-y-4 hidden', tabIndex === 0 && 'block!')}>
        <p class="text-18-m mb-3">썸네일</p>

        {#if thumbnailId}
          <div class="border border-gray-200 px-4 py-3.5 rounded flex items-center justify-between">
            <div class="bg-#d9d9d9 square-15 rounded-sm" />

            <div class="flex items-center gap-1.5">
              <button type="button" on:click={() => (thumbnailId = undefined)}>
                <i class="i-tb-trash square-6" />
              </button>

              <button
                class="w-13.5 border border-gray-200 px-3 py-1 rounded-sm text-11-sb text-gray-400 text-center"
                type="button"
                on:click={() => thumbnailPicker.show()}
              >
                변경
              </button>
            </div>
          </div>
        {:else}
          <button
            class="flex items-center justify-between py-3 px-4 border border-dashed border-gray-200 rounded w-full"
            type="button"
            on:click={() => thumbnailPicker.show()}
          >
            <div class="flex items-center gap-1.5">
              <i class="i-tb-photo-up square-4.5 text-gray-300" />
              <span class="text-14-r">썸네일 이미지를 업로드해주세요</span>
            </div>

            <div class="text-11-sb text-white bg-teal-500 rounded-sm py-1 px-3">업로드</div>
          </button>
        {/if}
      </div>

      <div class={clsx('space-y-4 hidden', tabIndex === 1 && 'block!')}>
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
                      selectedCollectionId = collection.id;
                      collectionSelectorOpen = false;
                    }}
                  >
                    <div class="flex items-center gap-1.5">
                      <span class="text-12-r truncate">{collection.name}</span>
                    </div>
                  </button>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>

      <div class={clsx('space-y-4 hidden', tabIndex === 2 && 'block!')}>
        <div>
          <p class="text-18-m mb-3 flex gap-1.5">
            <span>카테고리</span>
            <Tooltip class="flex center" message="카테고리" placement="top">
              <i class="i-tb-alert-circle square-3.5 text-gray-400" />
            </Tooltip>
          </p>

          <SegmentButtonGroup>
            <ToggleButton name="category" type="radio" value="ORIGINAL">오리지널</ToggleButton>
            <ToggleButton name="category" type="radio" value="FANFICTION">2차창작</ToggleButton>
            <ToggleButton name="category" type="radio" value="NONFICTION">비문학</ToggleButton>
            <ToggleButton name="category" type="radio" value="OTHER">기타</ToggleButton>
          </SegmentButtonGroup>
        </div>

        <div>
          <p class="text-18-m mb-3 flex gap-1.5 pt-5">
            <span>페어</span>
            <Tooltip class="flex center" message="페어" placement="top">
              <i class="i-tb-alert-circle square-3.5 text-gray-400" />
            </Tooltip>
          </p>

          <div class="grid grid-cols-4 gap-0.5625rem">
            <ToggleButton checked={$data.pairs?.includes('BL')} on:change={(e) => checkPair(e, 'BL')}>BL</ToggleButton>
            <ToggleButton checked={$data.pairs?.includes('GL')} on:change={(e) => checkPair(e, 'GL')}>GL</ToggleButton>
            <ToggleButton checked={$data.pairs?.includes('HL')} on:change={(e) => checkPair(e, 'HL')}>HL</ToggleButton>
            <ToggleButton checked={$data.pairs?.includes('NONCP')} on:change={(e) => checkPair(e, 'NONCP')}>
              Non-CP
            </ToggleButton>
            <ToggleButton checked={$data.pairs?.includes('OTHER')} on:change={(e) => checkPair(e, 'OTHER')}>
              그 외
            </ToggleButton>
          </div>
        </div>

        <div>
          <p class="text-18-m mb-3 flex gap-1.5 pt-5">
            <span>작품</span>
            <Tooltip class="flex center" message="작품" placement="top">
              <i class="i-tb-alert-circle square-3.5 text-gray-400" />
            </Tooltip>
          </p>

          <form
            class="relative"
            on:submit|preventDefault
            on:outsideClick={() => (titleSearchOpen = false)}
            use:outsideClickEvent
          >
            <input
              class="rounded-1.5 bg-gray-50 py-2.5 pl-4 pr-11 text-14-r border border-gray-200 w-full"
              placeholder=""
              type="search"
              on:input={() => (titleSearchOpen = true)}
              bind:value={titleQuery}
            />
            <div class="absolute inset-y-0 right-4 flex center text-gray-700">
              <i class="i-tb-search square-4" />
            </div>

            {#if titleSearchOpen}
              <ul class="absolute left-0 w-full bg-white border border-gray-200 rounded-b-1.5 z-1">
                <li class="hover:bg-gray-100 last-of-type:rounded-b-1.5">
                  <button
                    class="py-2 px-1.5 w-full"
                    type="button"
                    on:click={() => {
                      titleSearchOpen = false;
                      titleQuery = '';
                    }}
                  >
                    <i class="i-tb-search square-3 text-gray-400 m-1.5" />
                    <span class="text-12-r">검색 결과</span>
                  </button>
                </li>
              </ul>
            {/if}
          </form>

          <!-- {#if postTags?.TITLE}
            <ul>
              {#each postTags.TITLE as tag (tag.name)}
                <Chip>{tag.kind}</Chip>
              {/each}
            </ul>
          {/if} -->
        </div>

        <div>
          <p class="text-18-m mb-3 flex gap-1.5 pt-5">
            <span>캐릭터</span>
            <Tooltip class="flex center" message="캐릭터" placement="top">
              <i class="i-tb-alert-circle square-3.5 text-gray-400" />
            </Tooltip>
          </p>

          <PublishMenuSearch
            onClick={(q) => console.log(q)}
            bind:query={characterQuery}
            on:submit={() => console.log(characterQuery)}
          />
        </div>

        <div>
          <p class="text-18-m mb-3 flex gap-1.5 pt-5">
            <span>커플링</span>
            <Tooltip class="flex center" message="커플링" placement="top">
              <i class="i-tb-alert-circle square-3.5 text-gray-400" />
            </Tooltip>
          </p>

          <PublishMenuSearch
            onClick={(q) => console.log(q)}
            bind:query={couplingQuery}
            on:submit={() => console.log(couplingQuery)}
          />
        </div>

        <div>
          <p class="text-18-m mb-3 flex gap-1.5 pt-5">
            <span>트리거 주의</span>
            <Tooltip class="flex center" message="트리거 주의" placement="top">
              <i class="i-tb-alert-circle square-3.5 text-gray-400" />
            </Tooltip>
          </p>

          <PublishMenuSearch
            onClick={(q) => console.log(q)}
            bind:query={triggerQuery}
            on:submit={() => console.log(triggerQuery)}
          />
        </div>

        <div class="pb-5">
          <p class="text-18-m mb-3 flex gap-1.5 pt-5">
            <span>추가 태그</span>
            <Tooltip class="flex center" message="추가 태그" placement="top">
              <i class="i-tb-alert-circle square-3.5 text-gray-400" />
            </Tooltip>
          </p>

          <PublishMenuSearch
            onClick={(q) => console.log(q)}
            bind:query={otherTagQuery}
            on:submit={() => console.log(otherTagQuery)}
          />
        </div>
      </div>

      <div class={clsx('space-y-4 hidden', tabIndex === 3 && 'block!')}>
        <div>
          <p class="text-18-m mb-3 flex gap-1.5">공개범위</p>
        </div>

        <RadioGroup
          name="visibility"
          items={[
            { label: '전체 공개', value: 'PUBLIC', icon: 'i-px2-globe', checked: $data.visibility === 'PUBLIC' },
            { label: '링크 공개', value: 'UNLISTED', icon: 'i-tb-link', checked: $data.visibility === 'UNLISTED' },
            { label: '멤버 공개', value: 'SPACE', icon: 'i-tb-users', checked: $data.visibility === 'SPACE' },
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
            class="mb-3 text-14-r"
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
          <p class="text-18-m mb-3 flex gap-1.5 pt-5">
            <span>콘텐츠 등급</span>
            <Tooltip class="flex center" message="콘텐츠 등급">
              <i class="i-tb-alert-circle square-3.5 text-gray-400" />
            </Tooltip>
          </p>

          <RadioGroup
            name="ageRating"
            items={[
              { label: '모든 연령', value: 'ALL', icon: 'i-px2-rating-all', checked: $data.ageRating === 'ALL' },
              { label: '15세 이상', value: 'R15', icon: 'i-px2-rating-15-plus', checked: $data.ageRating === 'R15' },
              { label: '성인물', value: 'R19', icon: 'i-tb-rating-18-plus', checked: $data.ageRating === 'R19' },
            ]}
          />
        </div>

        <div>
          <p class="text-18-m mb-3 flex gap-1.5 pt-5">
            <span>검색 공개</span>
            <Tooltip class="flex center" message="검색 공개">
              <i class="i-tb-alert-circle square-3.5 text-gray-400" />
            </Tooltip>
          </p>

          <SegmentButtonGroup>
            <ToggleButton checked={$data.externalSearchable} type="radio" bind:group={$data.externalSearchable}>
              외부검색허용
            </ToggleButton>
            <ToggleButton checked={!$data.externalSearchable} type="radio" bind:group={$data.externalSearchable}>
              비허용
            </ToggleButton>
          </SegmentButtonGroup>
        </div>
      </div>

      <div class={clsx('space-y-4 hidden', tabIndex === 4 && 'block!')}>
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

        <Switch name="protectContent" class="flex items-center justify-between" checked={$data.protectContent ?? true}>
          <div>
            <p class="text-14-m">게시물 내용 보호</p>
            <p class="text-11-r text-gray-700 mt-1">게시물의 내용을 보호하기 위해 우클릭 또는 복사를 제한해요</p>
          </div>
        </Switch>
      </div>
    </form>
  </div>

  <div class="text-right px-6 py-5 border-t border-gray-200">
    <button
      class="w-30 py-3 px-6 bg-gray-950 text-white text-14-m rounded-1.5 text-center"
      type="button"
      on:click={handleSubmit}
    >
      게시
    </button>
  </div>
</div>

{#if $query}
  <CreateSpaceModal $user={$query.me} {switchSpace} bind:open={createSpaceOpen} />
{/if}

<ThumbnailPicker bind:this={thumbnailPicker} keepBoundsWhenClosed on:change={(e) => (thumbnailId = e.detail.id)} />
