<script lang="ts">
  import clsx from 'clsx';
  import * as R from 'radash';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { Button, Image, ToggleButton, Tooltip } from '$lib/components';
  import { Logo } from '$lib/components/branding';
  import { Checkbox, Switch } from '$lib/components/forms';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { postKind } from '$lib/stores';
  import ToolbarButton from './ToolbarButton.svelte';
  import type { Editor, JSONContent } from '@tiptap/core';
  import type {
    ContentFilterCategory,
    PostKind,
    PostRevisionKind,
    PostVisibility,
    PublishPage_Header_query,
  } from '$glitch';

  let _query: PublishPage_Header_query;
  export { _query as $query };

  export let title: string;
  export let subtitle: string;
  export let content: JSONContent;
  export let editor: Editor | undefined;
  export let tags: string[] = [];

  let postId: string | undefined;
  let hasContentFilter = false;
  let visibility: PostVisibility = 'PUBLIC';
  let receiveTagContribution = true;
  let receiveFeedback = true;
  let discloseStats = true;
  let receivePatronage = true;
  let contentFilters: ContentFilterCategory[] = [];
  let usePassword = false;
  let password = '';
  let permalink = '';

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
        }
      }
    `),
  );

  let currentSpace: (typeof $query.me.spaces)[0];
  $: currentSpace = $query.me.spaces[0];

  $: canPublish = !!title;

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

  const updatePostOptions = graphql(`
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

  $: if (title && content) {
    handler();
  }

  postKind.set(((browser && localStorage.getItem('postKind')) as PostKind) || 'ARTICLE');

  postKind.subscribe((type) => {
    if (browser) return (localStorage.postKind = type);
  });

  const checkContentFilter = (e: Event, contentFilter: ContentFilterCategory) => {
    const { checked } = e.target as HTMLInputElement;

    if (checked) {
      contentFilters.push(contentFilter);
    } else {
      contentFilters.splice(contentFilters.indexOf(contentFilter), 1);
    }
    contentFilters = contentFilters;
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

    <div class="grow">
      <Menu class="mx-auto w-full max-w-92 bg-primary px-4 py-2 rounded-xl flex center gap-2" placement="bottom-end">
        <div slot="value" class="flex items-center justify-between w-full">
          <i class="i-lc-menu square-6 text-disabled" />

          <div class="flex grow center gap-2">
            <Image class="square-6 rounded-md" $image={currentSpace.icon} />
            <span class="body-15-b">{currentSpace.name}</span>
          </div>
        </div>

        {#each $query.me.spaces as space (space.id)}
          <MenuItem on:click={() => (currentSpace = space)}>
            <div class="flex center gap-2">
              <Image class="square-6 rounded-md" $image={space.icon} />
              <span class="body-15-b">{space.name}</span>
            </div>
          </MenuItem>
        {/each}
      </Menu>
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

      <div class="px-3 pt-4 pb-3.5 space-y-4 w-163">
        <p class="title-20-b">포스트 게시 옵션</p>

        <div>
          <p class="text-secondary mb-3">공개범위</p>

          <fieldset class="flex gap-6">
            <div class="flex gap-1.5 items-center">
              <input
                id="public"
                class="square-4.5"
                checked={visibility === 'PUBLIC'}
                type="radio"
                value="PUBLIC"
                on:input={() => (visibility = 'PUBLIC')}
              />
              <label class="grow body-15-sb" for="public">전체 공개</label>
            </div>
            <div class="flex gap-1.5 items-center">
              <input
                id="space"
                class="square-4.5"
                checked={visibility === 'SPACE'}
                type="radio"
                value="SPACE"
                on:input={() => (visibility = 'SPACE')}
              />
              <label class="grow body-15-sb flex items-center gap-1" for="space">
                멤버 공개
                <Tooltip message="성인 인증을 한 유저에게만 노출돼요" placement="top">
                  <i class="i-lc-help-circle square-4 text-secondary" />
                </Tooltip>
              </label>
            </div>
            <div class="flex gap-1.5 items-center">
              <input
                id="unlisted"
                class="square-4.5"
                checked={visibility === 'UNLISTED'}
                type="radio"
                value="UNLISTED"
                on:input={() => (visibility = 'UNLISTED')}
              />
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
          <Checkbox class="body-15-sb" checked={usePassword} on:change={() => (usePassword = !usePassword)}>
            비밀글
          </Checkbox>
          {#if usePassword}
            <input
              class="bg-surface-primary rounded-xl px-3 py-1 body-15-sb h-10"
              placeholder="비밀번호 입력"
              type="text"
              bind:value={password}
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
          on:change={() => (hasContentFilter = !hasContentFilter)}
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

        <Switch
          id="receiveTagContribution"
          class="flex items-center justify-between"
          bind:checked={receiveTagContribution}
        >
          <div>
            <p class="body-16-b">게시물 태그 수정 및 등록</p>
            <p class="body-15-m text-secondary">다른 독자들이 게시물의 태그를 수정할 수 있어요</p>
          </div>
        </Switch>

        <Switch id="receiveFeedback" class="flex items-center justify-between" bind:checked={receiveFeedback}>
          <div>
            <p class="body-16-b">게시물 피드백</p>
            <p class="body-15-m text-secondary">가장 오래 머무른 구간, 밑줄, 이모지 등 피드백을 받아요</p>
          </div>
        </Switch>

        <Switch name="discloseStats" class="flex items-center justify-between" bind:checked={discloseStats}>
          <div>
            <p class="body-16-b">게시물 세부 통계 공개</p>
            <p class="body-15-m text-secondary">조회수, 좋아요 수를 다른 독자들에게 공개해요</p>
          </div>
        </Switch>

        <Switch name="receivePatronage" class="flex items-center justify-between" bind:checked={receivePatronage}>
          <div>
            <p class="body-16-b">게시물 창작자 후원</p>
            <p class="body-15-m text-secondary">다른 독자들이 게시물에 자유롭게 후원을 할 수 있도록 해요</p>
          </div>
        </Switch>

        <Button
          class="w-full"
          size="xl"
          on:click={async () => {
            const resp = await revise('PUBLISHED');

            await updatePostOptions({
              postId: resp.id,
              contentFilters,
              discloseStats,
              receiveFeedback,
              receivePatronage,
              receiveTagContribution,
              visibility,
              tags,
              password,
            });

            await goto(`/${resp.space.slug}/${resp.permalink}`);
          }}
        >
          게시하기
        </Button>
      </div>
    </Menu>

    <Menu placement="bottom-end">
      <button slot="value" class="square-10 p-3 flex center" type="button">
        <i class="i-lc-more-vertical square-6" />
      </button>

      <MenuItem>저장이력</MenuItem>
      <MenuItem>
        <a href={`/${currentSpace.slug}/preview/${permalink}`} rel="noopener noreferrer" target="_blank">미리보기</a>
      </MenuItem>
    </Menu>
  </div>
</header>
