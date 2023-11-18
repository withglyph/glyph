<script lang="ts">
  import { PostKind } from '@prisma/client';
  import clsx from 'clsx';
  import * as R from 'radash';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { Button, Image, ToggleButton, Tooltip } from '$lib/components';
  import { Logo } from '$lib/components/branding';
  import { Checkbox, Switch } from '$lib/components/forms';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { createMutationForm } from '$lib/form';
  import { postKind } from '$lib/stores';
  import { portal } from '$lib/svelte/actions';
  import { UpdatePostOptionsInputSchema } from '$lib/validations/post';
  import CreateSpaceModal from '../../(default)/CreateSpaceModal.svelte';
  import ToolbarButton from './ToolbarButton.svelte';
  import type { PostRevision } from '@prisma/client';
  import type { Editor, JSONContent } from '@tiptap/core';
  import type { ContentFilterCategory, PostRevisionKind, PublishPage_Header_query } from '$glitch';
  import type { PublishPage_Header_PostOption } from '../types';

  let _query: PublishPage_Header_query;
  export { _query as $query };

  export let title: string;
  export let subtitle: PostRevision['subtitle'];
  export let content: JSONContent;
  export let editor: Editor | undefined;
  export let permalink: string | undefined = undefined;

  let _postOption: PublishPage_Header_PostOption;
  export { _postOption as postOption };

  let { hasPassword, ...postOption } = _postOption;

  let postId = postOption.postId;
  let hasContentFilter = postOption.contentFilters.length > 0;

  $: query = fragment(
    _query,
    graphql(`
      fragment PublishPage_Header_query on Query {
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

          ...DefaultLayout_CreateSpaceModal_user
        }
      }
    `),
  );

  let createSpaceOpen = false;
  let currentSpaceOpen = false;
  let currentSpace: (typeof $query.me.spaces)[0];
  $: currentSpace = $query.me.spaces[0];

  $: canPublish = !!title;

  const { form, setData } = createMutationForm({
    initialValues: { ...postOption, password: hasPassword ? '' : null },
    schema: UpdatePostOptionsInputSchema,
    mutation: graphql(`
      mutation PublishPage_UpdatePostOptions_Mutation($input: UpdatePostOptionsInput!) {
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

          revision {
            id
            content
          }
        }
      }
    `),
    onSuccess: async () => {
      const resp = await revise('PUBLISHED');
      await goto(`/${resp.space.slug}/${resp.permalink}`);
    },
  });

  const revisePost = graphql(`
    mutation PublishPage_RevisePost_Mutation($input: RevisePostInput!) {
      revisePost(input: $input) {
        id
        permalink

        space {
          id
          slug
        }
      }
    }
  `);

  const revise = async (revisionKind: PostRevisionKind) => {
    const resp = await revisePost({
      postId,
      revisionKind,
      title,
      spaceId: currentSpace.id,
      subtitle,
      content,
    });

    postId = resp.id;
    permalink = resp.permalink;

    return resp;
  };

  const handler = R.debounce({ delay: 1000 }, async () => {
    await revise('AUTO_SAVE');
  });

  $: if (browser && title && content) {
    handler();
  }

  postKind.set(((browser && localStorage.getItem('postKind')) as PostKind) || 'ARTICLE');

  postKind.subscribe((type) => {
    if (browser) return (localStorage.postKind = type);
  });

  const checkContentFilter = (e: Event, contentFilter: ContentFilterCategory) => {
    const { checked } = e.target as HTMLInputElement;

    if (checked) {
      setData(($data) => ({ ...$data, contentFilters: [...$data.contentFilters, contentFilter] }));
    } else {
      setData(($data) => ({
        ...$data,
        contentFilters: $data.contentFilters.filter((filter) => filter !== contentFilter),
      }));
    }
  };
</script>

<header class="sticky top-0 z-50 border-b border-secondary bg-white py-2 px-4 sm:px-7.5 h-15.25 flex center">
  <div class="w-full max-w-300 flex items-center gap-2">
    <Logo class="square-6" />

    <div
      class={clsx(
        "bg-surface-primary rounded-3xl h-10 w-fit grid relative grid-cols-2 before:(content-[''] absolute w-50% h-100% left-0 bg-gray-70 rounded-3xl transition-all)",
        $postKind === 'GALLERY' && 'before:left-50%',
      )}
    >
      <button
        class={clsx(
          'h-10 py-2 px-4 flex items-center gap-2 z-1',
          $postKind === 'ARTICLE' && 'first:(text-white transition-color) last:(text-gray-70 transition-color)',
          $postKind === 'GALLERY' && 'first:(text-gray-70 transition-color) last:(text-white transition-color)',
        )}
        type="button"
        on:click={() => {
          postKind.update(() => 'ARTICLE');
          localStorage.setItem('postKind', 'ARTICLE');
        }}
      >
        <i class="i-lc-file-text square-5" />
        <span class="body-14-b">글 모드</span>
      </button>
      <button
        class={clsx(
          'h-10 py-2 px-4 flex items-center gap-2 z-1',
          $postKind === 'ARTICLE' && 'first:(text-white transition) last:(text-gray-70 transition)',
          $postKind === 'GALLERY' && 'first:(text-gray-70 transition) last:(text-white transition)',
        )}
        type="button"
        on:click={() => {
          postKind.update(() => 'GALLERY');
          localStorage.setItem('postKind', 'GALLERY');
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
        type="button"
        on:click={() => (currentSpaceOpen = !currentSpaceOpen)}
      >
        <i class="i-lc-menu square-6 text-disabled absolute" />

        <div class="flex grow center gap-2">
          <Image class="square-6 rounded-md" $image={currentSpace.icon} />
          <span class="body-15-b">{currentSpace.name}</span>
        </div>
      </button>

      {#if currentSpaceOpen}
        <div
          class="fixed inset-0 z-49"
          role="button"
          tabindex="-1"
          on:click={() => (currentSpaceOpen = false)}
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
                  currentSpace = space;
                  currentSpaceOpen = false;
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

    <Tooltip>
      <div class="flex flex-col text-right w-36.5">
        <span class="body-15-b">
          <mark class="text-blue-50">80</mark>
          자
        </span>
        <span class="caption-12-m text-disabled">마지막으로 저장된 시간 13:00</span>
      </div>

      <div slot="message">
        <div class="caption-12-m">
          <span class="text-secondary w-17.5 inline-block">공백 미포함</span>
          <span class="text-rights">80자</span>
        </div>
        <div class="caption-12-m">
          <span class="text-secondary w-17.5 inline-block">공백 포함</span>
          <span class="text-rights">80자</span>
        </div>
      </div>
    </Tooltip>

    <div class="flex">
      <Button
        class="body-15-b disabled:border! border-r-none rounded-r-none peer"
        color="tertiary"
        disabled={!canPublish}
        loading={$revisePost.inflight}
        size="lg"
        variant="outlined"
        on:click={() => revise('MANUAL_SAVE')}
      >
        임시저장
      </Button>
      <Button
        class="text-blue-50 body-15-b rounded-l-none peer-enabled:peer-hover:border-l-border-primary"
        color="tertiary"
        size="lg"
        variant="outlined"
      >
        18
      </Button>
    </div>

    <Menu>
      <Button slot="value" disabled={!canPublish} loading={$revisePost.inflight} size="lg">포스트 게시</Button>

      <MenuItem class="square-6! flex center absolute top-6 right-6 p-0!">
        <i class="i-lc-x" />
      </MenuItem>

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
                <Tooltip message="성인 인증을 한 유저에게만 노출돼요" placement="top">
                  <i class="i-lc-help-circle square-4 text-secondary" />
                </Tooltip>
              </label>
            </div>
            <div class="flex gap-1.5 items-center">
              <input id="unlisted" name="visibility" class="square-4.5" type="radio" value="UNLISTED" />
              <label class="grow body-15-sb flex items-center gap-1" for="unlisted">
                링크 공개
                <Tooltip message="성인 인증을 한 유저에게만 노출돼요" placement="top">
                  <i class="i-lc-help-circle square-4 text-secondary" />
                </Tooltip>
              </label>
            </div>
          </fieldset>
        </div>

        <div class="flex gap-6 items-center h-10">
          <Checkbox
            class="body-15-sb"
            checked={hasPassword}
            on:change={() => {
              hasPassword = !hasPassword;
              setData(($data) => ({ ...$data, password: null }));
            }}
          >
            비밀글
          </Checkbox>
          {#if hasPassword}
            <input
              name="password"
              class="bg-surface-primary rounded-xl px-3 py-1 body-15-sb h-10"
              placeholder="비밀번호 입력"
              type="text"
            />
          {/if}
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
          checked={hasContentFilter}
          on:change={() => {
            hasContentFilter = !hasContentFilter;
            setData(($data) => ({ ...$data, contentFilters: [] }));
          }}
        >
          트리거 워닝
        </Checkbox>

        {#if hasContentFilter}
          <div class="grid grid-cols-5 gap-2">
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
        {/if}

        <p class="text-secondary">세부 설정</p>

        <Switch name="receiveTagContribution" class="flex items-center justify-between">
          <div>
            <p class="body-16-b">게시물 태그 수정 및 등록</p>
            <p class="body-15-m text-secondary">다른 독자들이 게시물의 태그를 수정할 수 있어요</p>
          </div>
        </Switch>

        <Switch id="receiveFeedback" name="receiveFeedback" class="flex items-center justify-between">
          <div>
            <p class="body-16-b">게시물 피드백</p>
            <p class="body-15-m text-secondary">가장 오래 머무른 구간, 밑줄, 이모지 등 피드백을 받아요</p>
          </div>
        </Switch>

        <Switch name="discloseStats" class="flex items-center justify-between">
          <div>
            <p class="body-16-b">게시물 세부 통계 공개</p>
            <p class="body-15-m text-secondary">조회수, 좋아요 수를 다른 독자들에게 공개해요</p>
          </div>
        </Switch>

        <Switch name="receivePatronage" class="flex items-center justify-between">
          <div>
            <p class="body-16-b">게시물 창작자 후원</p>
            <p class="body-15-m text-secondary">다른 독자들이 게시물에 자유롭게 후원을 할 수 있도록 해요</p>
          </div>
        </Switch>

        <Button class="w-full" size="xl" type="submit">게시하기</Button>
      </form>
    </Menu>

    <Menu placement="bottom-end">
      <button slot="value" class="square-10 p-3 flex center" type="button">
        <i class="i-lc-more-vertical square-6" />
      </button>

      <MenuItem>저장이력</MenuItem>
      <MenuItem>
        <Button disabled={!!permalink} href={`/${currentSpace.slug}/preview/${permalink}`} type="link" variant="text">
          미리보기
        </Button>
      </MenuItem>
    </Menu>
  </div>
</header>

<CreateSpaceModal $user={$query.me} bind:open={createSpaceOpen} />
