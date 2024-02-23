<script lang="ts">
  import clsx from 'clsx';
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Image, SegmentButtonGroup, ToggleButton, Tooltip } from '$lib/components';
  import { Checkbox, FormValidationMessage, Switch } from '$lib/components/forms';
  import ThumbnailPicker from '$lib/components/media/ThumbnailPicker.svelte';
  import { CreateCollectionModal } from '$lib/components/pages/collections';
  import { createMutationForm } from '$lib/form';
  import { PublishPostInputSchema } from '$lib/validations/post';
  import CreateSpaceModal from '../../(default)/CreateSpaceModal.svelte';
  import { getEditorContext } from './context';
  import PublishMenuSearch from './PublishMenuSearch.svelte';
  import RadioGroup from './RadioGroup.svelte';
  import type { ChangeEventHandler } from 'svelte/elements';
  import type { EditorPage_PublishMenu_post, EditorPage_PublishMenu_query, Image_image, PostPair } from '$glitch';

  export { _post as $post, _query as $query };
  let _post: EditorPage_PublishMenu_post;
  let _query: EditorPage_PublishMenu_query;
  export let open = false;

  const { forceSave } = getEditorContext();

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
        ageRating

        thumbnail {
          id
          ...Image_image
        }

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

        draftRevision {
          id
        }

        collection {
          id
        }

        ...EditorPage_RevisionListModal_Post
      }
    `),
  );

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
      const revisionId = await forceSave();
      return {
        revisionId,
        spaceId: selectedSpaceId,
        collectionId: selectedCollectionId,
        thumbnailId: currentThumbnail?.id,
      };
    },
    onSuccess: async (resp) => {
      mixpanel.track('post:publish', { postId: resp.id });
      await goto(`/${resp.space.slug}/${resp.permalink}`);
    },
  });

  $: setInitialValues({
    revisionId: $post.draftRevision.id,
    spaceId: $post.space ? $post.space.id : '',
    collectionId: $post.collection ? $post.collection.id : undefined,
    thumbnailId: $post.thumbnail?.id,
    visibility: $post.visibility,
    password: $post.hasPassword ? '' : undefined,
    ageRating: $post.ageRating,
    externalSearchable: $post.externalSearchable,
    discloseStats: $post.discloseStats,
    receiveFeedback: $post.receiveFeedback,
    receivePatronage: $post.receivePatronage,
    receiveTagContribution: $post.receiveTagContribution,
    protectContent: $post.protectContent,
    // TODO: CI 에러 방지용으로 넣은 줄이고 나중에 실제 데이터 붙여야 해요
    receiveComment: true,
    category: $post.category,
    pairs: $post.pairs ?? [],
    tags: $post.tags.map((t) => ({ name: t.tag.name, kind: t.kind })),
  });

  let enablePassword = false;
  let createSpaceOpen = false;
  let createCollectionOpen = false;

  $: if ($post?.hasPassword) {
    enablePassword = true;
  }

  let selectedSpaceId: string | undefined = undefined;

  $: selectedSpace = $query.me.spaces.find((space) => space.id === selectedSpaceId);

  let spaceSelectorOpen = false;
  let collectionSelectorOpen = false;

  let tabIndex = 0;
  let selectedCollectionId: string | undefined = undefined;

  $: selectedCollection = selectedSpace?.collections.find((collection) => collection.id === selectedCollectionId);

  let titleQuery = '';
  let characterQuery = '';
  let couplingQuery = '';
  let triggerQuery = '';
  let extraQuery = '';

  let thumbnailPicker: ThumbnailPicker;

  let thumbnail: ({ id: string } & Image_image) | null | undefined = undefined;
  $: currentThumbnail = thumbnail === undefined ? $post.thumbnail : thumbnail;

  const checkPair = (e: Parameters<ChangeEventHandler<HTMLInputElement>>[0], pair: PostPair) => {
    const { checked } = e.currentTarget;

    $data.pairs = checked ? ($data.pairs ? [...$data.pairs, pair] : [pair]) : $data.pairs?.filter((v) => v !== pair);
  };

  onMount(() => {
    selectedSpaceId = $post.space?.id;
    selectedCollectionId = $post.collection?.id;
  });
</script>

<div
  class={clsx(
    'bg-white z-50 <sm:(w-full shadow-[0px_8px_24px_0px_rgba(0,0,0,0.28)] rounded-t-3.5) sm:(border border-gray-200 border-t-none rounded-b-lg shadow-[0px_5px_22px_0px_rgba(0,0,0,0.06)])',
    !open && 'hidden!',
  )}
>
  <div class="py-4 px-6 border-b border-gray-200 <sm:border-gray-100">
    <p class="text-16-sb <sm:(text-center relative)">
      게시 옵션
      <button class="i-tb-x square-6 absolute right-0 sm:hidden" type="button" on:click={() => (open = false)}></button>
    </p>
    <span class="text-12-r text-gray-500 mt-0.5 <sm:hidden">
      다양한 옵션을 선택해 원하는 방식으로 게시글을 업로드할 수 있어요
    </span>
  </div>

  <div class="flex <sm:flex-col">
    <div
      class="w-52 flex py-1.5 <sm:(flex-row w-full overflow-x-auto whitespace-nowrap py-4 px-5 gap-7) sm:(border-r flex-col border-gray-200 gap-1.5)"
    >
      <button
        class={clsx(
          'flex items-center text-15-sb <sm:(border-b-2 border-white text-gray-300 aria-pressed:(border-gray-950 text-gray-950)) sm:(text-13-r py-1 mx-2 rounded aria-pressed:bg-gray-50 hover:bg-gray-50)',
        )}
        aria-pressed={tabIndex === 0}
        type="button"
        on:click={() => (tabIndex = 0)}
      >
        {#if selectedSpaceId || $post.space}
          <i class="i-px2-checkmark square-6 text-teal-500 <sm:hidden" />
        {:else}
          <i class="i-px2-dot square-6 text-pink-500 <sm:hidden" />
        {/if}
        <span class="w-full pb-2 sm:(py-2 px-1)">발행</span>
      </button>
      <button
        class={clsx(
          'flex items-center text-15-sb <sm:(border-b-2 border-white text-gray-300 aria-pressed:(border-gray-950 text-gray-950)) sm:(text-13-r py-1 mx-2 rounded aria-pressed:bg-gray-50 hover:bg-gray-50)',
        )}
        aria-pressed={tabIndex === 1}
        type="button"
        on:click={() => (tabIndex = 1)}
      >
        {#if $data.tags?.length > 0}
          <i class="i-px2-checkmark square-6 text-teal-500 <sm:hidden" />
        {:else}
          <i class="i-px2-checkmark square-6 text-gray-300 <sm:hidden" />
        {/if}
        <span class="w-full pb-2 sm:(py-2 px-1)">태그</span>
      </button>
      <button
        class={clsx(
          'flex items-center text-15-sb <sm:(border-b-2 border-white text-gray-300 aria-pressed:(border-gray-950 text-gray-950)) sm:(text-13-r py-1 mx-2 rounded aria-pressed:bg-gray-50 hover:bg-gray-50)',
        )}
        aria-pressed={tabIndex === 2}
        type="button"
        on:click={() => (tabIndex = 2)}
      >
        {#if currentThumbnail}
          <i class="i-px2-checkmark square-6 text-teal-500 <sm:hidden" />
        {:else}
          <i class="i-px2-checkmark square-6 text-gray-300 <sm:hidden" />
        {/if}
        <span class="w-full pb-2 sm:(py-2 px-1)">썸네일</span>
      </button>
      <button
        class={clsx(
          'flex items-center text-15-sb <sm:(border-b-2 border-white text-gray-300 aria-pressed:(border-gray-950 text-gray-950)) sm:(text-13-r py-1 mx-2 rounded aria-pressed:bg-gray-50 hover:bg-gray-50)',
        )}
        aria-pressed={tabIndex === 3}
        type="button"
        on:click={() => (tabIndex = 3)}
      >
        <i class="i-px2-checkmark square-6 text-teal-500 <sm:hidden" />
        <span class="w-full pb-2 sm:(py-2 px-1)">대상 독자</span>
      </button>
      <button
        class={clsx(
          'flex items-center text-15-sb <sm:(border-b-2 border-white text-gray-300 aria-pressed:(border-gray-950 text-gray-950)) sm:(text-13-r py-1 mx-2 rounded aria-pressed:bg-gray-50 hover:bg-gray-50)',
        )}
        aria-pressed={tabIndex === 4}
        type="button"
        on:click={() => (tabIndex = 4)}
      >
        <i class="i-px2-checkmark square-6 text-teal-500 <sm:hidden" />
        <span class="w-full pb-2 sm:(py-2 px-1)">세부 옵션</span>
      </button>
    </div>

    <form class="w-96 py-5 px-6 overflow-y-auto <sm:(w-full pt-0 pb-8 px-5 h-50vh) sm:h-108" use:form>
      <input name="thumbnailId" type="hidden" value={currentThumbnail?.id} />

      <div class={clsx('space-y-8 hidden', tabIndex === 0 && 'block!')}>
        <div>
          <p class="text-14-sb pt-1 pb-2 <sm:text-15-m">스페이스</p>

          <div class="mb-4 relative">
            <Tooltip
              enabled={$post.state === 'PUBLISHED'}
              message="이미 게시한 포스트는 스페이스를 바꿀 수 없어요"
              offset={16}
              placement="top"
            >
              <button
                class={clsx(
                  'flex items-center justify-between w-full rounded-md p-3 border border-gray-200 hover:bg-gray-50 disabled:bg-gray-50',
                  spaceSelectorOpen && 'rounded-b-none',
                )}
                disabled={$post.state === 'PUBLISHED'}
                type="button"
                on:click={() => (spaceSelectorOpen = true)}
              >
                {#if selectedSpace}
                  <div class="flex items-center gap-2">
                    <Image class="square-6 rounded-sm flex-none" $image={selectedSpace.icon} />
                    <span class="text-13-m truncate">{selectedSpace.name}</span>
                  </div>
                {:else}
                  <span class="text-gray-500 text-13-r">스페이스를 선택해주세요</span>
                {/if}

                <p class="flex center square-6">
                  <i
                    class={clsx('square-4.5', spaceSelectorOpen ? 'i-tb-caret-up-filled' : 'i-tb-caret-down-filled')}
                  />
                </p>
              </button>
            </Tooltip>

            {#if spaceSelectorOpen}
              <div
                class="fixed inset-0 z-57"
                role="button"
                tabindex="-1"
                on:click={() => (spaceSelectorOpen = false)}
                on:keypress={null}
              />

              <ul
                class="absolute z-59 top-48px left-0 w-full rounded-b-md bg-white border border-gray-200"
                transition:slide={{ axis: 'y', duration: 250 }}
              >
                {#each $query.me.spaces as space (space.id)}
                  <li class="border-b border-gray-200">
                    <button
                      class="p-3 w-full hover:bg-gray-100 flex justify-between items-center"
                      type="button"
                      on:click={() => {
                        if (selectedSpaceId !== space.id) {
                          selectedCollectionId = undefined;
                        }

                        selectedSpaceId = space.id;
                        spaceSelectorOpen = false;
                      }}
                    >
                      <div class="flex items-center gap-2">
                        <Image class="square-6 rounded-sm flex-none" $image={space.icon} />
                        <span class="text-13-m truncate">{space.name}</span>
                      </div>
                    </button>
                  </li>
                {/each}
                <li>
                  <button
                    class="text-13-m p-3 w-full rounded-b-md flex items-center justify-between hover:bg-gray-100"
                    type="button"
                    on:click={() => (createSpaceOpen = true)}
                  >
                    새로운 스페이스 추가하기
                    <i class="i-tb-plus square-6 text-gray-400" />
                  </button>
                </li>
              </ul>
            {/if}
          </div>
        </div>

        <div>
          <p class="text-14-sb pt-1 pb-2 <sm:text-15-m">컬렉션</p>

          <div class="relative">
            <button
              class={clsx(
                'flex items-center justify-between w-full p-3 rounded-md border border-gray-200 hover:bg-gray-100 disabled:bg-gray-100',
                collectionSelectorOpen && 'rounded-b-none',
              )}
              disabled={!selectedSpace}
              type="button"
              on:click={() => (collectionSelectorOpen = true)}
            >
              {#if selectedCollection}
                <span class="text-13-m truncate">{selectedCollection.name}</span>
              {:else}
                <span class="text-gray-500 text-13-r">컬렉션을 선택해주세요</span>
              {/if}

              <p class="flex center square-6">
                <i
                  class={clsx('square-4.5', collectionSelectorOpen ? 'i-tb-caret-up-filled' : 'i-tb-caret-down-filled')}
                />
              </p>
            </button>

            {#if collectionSelectorOpen && selectedSpace?.collections}
              <div
                class="fixed inset-0 z-57"
                role="button"
                tabindex="-1"
                on:click={() => (collectionSelectorOpen = false)}
                on:keypress={null}
              />

              <ul
                class="absolute z-59 top-48px left-0 w-full rounded-b-md bg-white border border-gray-200"
                transition:slide={{ axis: 'y', duration: 250 }}
              >
                {#if selectedCollectionId !== undefined}
                  <li class="border-b border-gray-200">
                    <button
                      class="p-3 w-full hover:bg-gray-100 flex justify-between items-center"
                      type="button"
                      on:click={() => {
                        selectedCollectionId = undefined;
                        collectionSelectorOpen = false;
                      }}
                    >
                      <div class="flex items-center gap-1.5">
                        <span class="text-13-m truncate">선택 안함</span>
                      </div>
                    </button>
                  </li>
                {/if}
                {#each selectedSpace?.collections as collection (collection.id)}
                  <li class="border-b border-gray-200">
                    <button
                      class="p-3 w-full hover:bg-gray-100 flex justify-between items-center"
                      type="button"
                      on:click={() => {
                        selectedCollectionId = collection.id;
                        collectionSelectorOpen = false;
                      }}
                    >
                      <div class="flex items-center gap-1.5">
                        <span class="text-13-m truncate">{collection.name}</span>
                      </div>
                    </button>
                  </li>
                {/each}
                <li>
                  <button
                    class="text-13-m p-3 w-full rounded-b-md flex items-center justify-between hover:bg-gray-100"
                    type="button"
                    on:click={() => (createCollectionOpen = true)}
                  >
                    새로운 컬렉션 추가하기
                    <i class="i-tb-plus square-6 text-gray-400" />
                  </button>
                </li>
              </ul>
            {/if}
          </div>
        </div>
      </div>

      <div class={clsx('space-y-8 hidden', tabIndex === 1 && 'block!')}>
        <div>
          <p class="text-14-sb pt-1 pb-2 flex gap-1 <sm:text-15-m">
            <span>카테고리</span>
            <!-- <Tooltip class="flex center" message="카테고리" placement="top">
              <i class="i-tb-alert-circle square-3.5 text-gray-400" />
            </Tooltip> -->
          </p>

          <SegmentButtonGroup>
            <ToggleButton name="category" type="radio" value="ORIGINAL">오리지널</ToggleButton>
            <ToggleButton name="category" type="radio" value="FANFICTION">2차창작</ToggleButton>
            <ToggleButton name="category" type="radio" value="NONFICTION">비문학</ToggleButton>
            <ToggleButton name="category" type="radio" value="OTHER">기타</ToggleButton>
          </SegmentButtonGroup>
        </div>

        <div>
          <p class="text-14-sb pt-1 pb-2 flex gap-1 <sm:text-15-m">
            <span>페어</span>
            <Tooltip class="flex center" message="중복 선택하거나 아무것도 선택하지 않을 수 있어요" placement="top">
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

        <PublishMenuSearch
          kind="TITLE"
          label="작품"
          placeholder="예) 마법소녀_펜슬이"
          tooltip="여러 명칭을 쓸 수 있어요"
          bind:tags={$data.tags}
          bind:query={titleQuery}
        />

        <PublishMenuSearch
          kind="CHARACTER"
          label="캐릭터"
          placeholder="예) 펜슬이"
          tooltip="등장 캐릭터가 너무 많다면 주연만 써도 좋아요"
          bind:tags={$data.tags}
          bind:query={characterQuery}
        />

        <PublishMenuSearch
          kind="COUPLING"
          label="커플링"
          placeholder="예) AAxBB"
          tooltip="커플링명은 자주 쓰이는 이름으로 하면 좋아요"
          bind:tags={$data.tags}
          bind:query={couplingQuery}
        />

        <PublishMenuSearch
          kind="TRIGGER"
          label="트리거 주의"
          placeholder="예) 스포일러, 폭력성 등"
          tooltip="이 포스트를 독자들이 볼 때 주의해야 할 사항을 입력해주세요"
          bind:tags={$data.tags}
          bind:query={triggerQuery}
        />

        <PublishMenuSearch
          kind="EXTRA"
          label="추가 태그"
          placeholder="추가 태그"
          tooltip="위 분류에 속하지 않지만 추가적으로 넣고 싶은 태그를 입력해주세요"
          bind:tags={$data.tags}
          bind:query={extraQuery}
        />
      </div>

      <div class={clsx('hidden', tabIndex === 2 && 'block!')}>
        <p class="text-14-sb pt-1 pb-2 <sm:text-15-m">썸네일</p>

        {#if currentThumbnail}
          <div class="border border-gray-200 px-4 py-3.5 rounded flex items-center justify-between">
            <Image class="bg-#d9d9d9 square-15 rounded-sm" $image={currentThumbnail} />

            <div class="flex items-center gap-1.5">
              <button type="button" on:click={() => (thumbnail = null)}>
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
            class="flex items-center justify-between p-3 border border-gray-200 rounded w-full"
            type="button"
            on:click={() => thumbnailPicker.show()}
          >
            <div class="flex items-center gap-1.5">
              <i class="i-tb-photo square-4.5 text-gray-300" />
              <span class="text-13-m text-gray-400">썸네일 이미지를 선택해주세요</span>
            </div>

            <div class="text-11-sb text-white bg-teal-500 rounded py-1.5 px-3.5">업로드</div>
          </button>
        {/if}
      </div>

      <div class={clsx('space-y-8 hidden', tabIndex === 3 && 'block!')}>
        <div>
          <p class="text-14-sb py-1 <sm:text-15-m">공개범위</p>

          <RadioGroup
            name="visibility"
            class="my-2.5"
            items={[
              {
                label: '전체 공개',
                value: 'PUBLIC',
                icon: 'i-px2-globe',
                checked: $data.visibility === 'PUBLIC',
              },
              { label: '링크 공개', value: 'UNLISTED', icon: 'i-px2-link', checked: $data.visibility === 'UNLISTED' },
              { label: '멤버 공개', value: 'SPACE', icon: 'i-px2-users', checked: $data.visibility === 'SPACE' },
            ]}
          />
        </div>

        <div>
          <p class="text-14-sb py-2 flex gap-1">
            <span>비밀글</span>
            <Tooltip class="flex center" message="설정하면 비밀번호를 입력한 독자만 내용을 열람할 수 있어요">
              <i class="i-tb-alert-circle square-3.5 text-gray-400" />
            </Tooltip>
          </p>

          <Checkbox
            class="mb-3 mt-1.5 text-14-r"
            checked={enablePassword}
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
          <p class="text-14-sb py-1 flex gap-1">
            <span>콘텐츠 등급</span>
            <Tooltip
              class="flex center"
              message="연령 제한을 설정하면 본인인증이 완료된 해당 나이 이상의 독자만 내용을 열람할 수 있어요"
            >
              <i class="i-tb-alert-circle square-3.5 text-gray-400" />
            </Tooltip>
          </p>

          <RadioGroup
            name="ageRating"
            class="my-2.5"
            items={[
              { label: '모든 연령', value: 'ALL', text: 'ALL', checked: $data.ageRating === 'ALL' },
              { label: '15세 이상', value: 'R15', text: '15+', checked: $data.ageRating === 'R15' },
              { label: '성인물', value: 'R19', text: '20+', checked: $data.ageRating === 'R19' },
            ]}
          />
        </div>

        <div>
          <p class="text-14-sb py-1 flex gap-1 mb-1.5">
            <span>검색 공개</span>
            <Tooltip class="flex center" message="외부 검색엔진에서 이 포스트를 검색할 수 있을지 설정해요">
              <i class="i-tb-alert-circle square-3.5 text-gray-400" />
            </Tooltip>
          </p>

          <SegmentButtonGroup>
            <ToggleButton
              checked={$data.externalSearchable}
              on:change={(event) => {
                $data.externalSearchable = event.currentTarget.checked;
              }}
            >
              외부 검색 허용
            </ToggleButton>
            <ToggleButton
              checked={!$data.externalSearchable}
              on:change={(event) => {
                $data.externalSearchable = !event.currentTarget.checked;
              }}
            >
              외부 검색 비허용
            </ToggleButton>
          </SegmentButtonGroup>
        </div>
      </div>

      <div class={clsx('space-y-8 hidden', tabIndex === 4 && 'block!')}>
        <Switch
          name="receiveFeedback"
          class="flex items-center justify-between"
          checked={$data.receiveFeedback ?? true}
        >
          <div>
            <p class="text-14-sb py-1 <sm:text-15-m">피드백</p>
            <p class="text-11-r text-gray-400 sm:(mt-1 text-gray-700)">
              가장 오래 머무른 구간, 밑줄, 이모지 등 피드백을 받아요
            </p>
          </div>
        </Switch>

        <Switch name="discloseStats" class="flex items-center justify-between" checked={$data.discloseStats ?? true}>
          <div>
            <p class="text-14-sb py-1 <sm:text-15-m">게시물 세부 공개</p>
            <p class="text-11-r text-gray-400 sm:(mt-1 text-gray-700)">독자에게 좋아요, 조회수를 공유해요</p>
          </div>
        </Switch>

        <Switch
          name="receivePatronage"
          class="flex items-center justify-between"
          checked={$data.receivePatronage ?? true}
        >
          <div>
            <p class="text-14-sb py-1 <sm:text-15-m">창작자 후원</p>
            <p class="text-11-r text-gray-400 sm:(mt-1 text-gray-700)">독자들이 게시물에 자유롭게 후원할 수 있어요</p>
          </div>
        </Switch>

        <Switch name="protectContent" class="flex items-center justify-between" checked={$data.protectContent ?? true}>
          <div>
            <p class="text-14-sb py-1 <sm:text-15-m">게시물 내용 보호</p>
            <p class="text-11-r text-gray-400 sm:(mt-1 text-gray-700)">
              게시물의 내용을 보호하기 위해 우클릭 또는 복사를 제한해요
            </p>
          </div>
        </Switch>
      </div>
    </form>
  </div>

  <div class="flex justify-end px-6 py-5 sm:(border-t border-gray-200)">
    <Tooltip
      class="<sm:w-full"
      enabled={!selectedSpaceId}
      message="게시할 스페이스를 선택해주세요"
      offset={12}
      placement="top"
    >
      <button
        class="w-24 py-2 px-8 text-14-m text-white bg-gray-950 rounded text-center <sm:(w-full text-16-sb py-2.5)"
        disabled={!selectedSpaceId}
        type="button"
        on:click={handleSubmit}
      >
        발행
      </button>
    </Tooltip>
  </div>
</div>

{#if $query}
  <CreateSpaceModal
    $user={$query.me}
    via="editor"
    bind:open={createSpaceOpen}
    on:create={(event) => {
      selectedSpaceId = event.detail.id;
      selectedCollectionId = undefined;
      spaceSelectorOpen = false;
    }}
  />
{/if}

{#if selectedSpaceId}
  <CreateCollectionModal bind:open={createCollectionOpen} bind:spaceId={selectedSpaceId} />
{/if}

<ThumbnailPicker bind:this={thumbnailPicker} keepBoundsWhenClosed on:change={(e) => (thumbnail = e.detail)} />
