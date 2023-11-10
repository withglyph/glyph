<script lang="ts">
  import clsx from 'clsx';
  import * as R from 'radash';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { Button, Image, Modal, ToggleButton } from '$lib/components';
  import { Logo } from '$lib/components/branding';
  import { Checkbox } from '$lib/components/forms';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { postKind } from '$lib/stores';
  import ToolbarButton from './ToolbarButton.svelte';
  import type { Editor, JSONContent } from '@tiptap/core';
  import type { PostKind, PostRevisionKind, PublishPage_Header_query } from '$glitch';

  let _query: PublishPage_Header_query;
  export { _query as $query };

  export let title: string;
  export let subtitle: string;
  export let content: JSONContent;
  export let editor: Editor | undefined;

  let postId: string | undefined;
  let open = false;

  $: query = fragment(
    _query,
    graphql(`
      fragment PublishPage_Header_query on Query {
        me @_required {
          id

          spaces {
            id
            name

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

    <div class="flex flex-col text-right">
      <span class="body-15-b">
        <mark class="text-blue-50">80</mark>
        자
      </span>
      <span class="caption-12-m text-disabled">마지막으로 저장된 시간 13:00</span>
    </div>

    <Button
      color="tertiary"
      disabled={!canPublish}
      loading={$revisePost.inflight}
      size="lg"
      variant="outlined"
      on:click={() => revise('MANUAL_SAVE')}
    >
      저장 <span class="text-secondary">18</span>
    </Button>

    <Button
      disabled={!canPublish}
      loading={$revisePost.inflight}
      size="lg"
      on:click={async () => {
        open = true;
      }}
    >
      포스트 게시
    </Button>

    <Menu placement="bottom-end">
      <button slot="value" class="square-10 p-3 flex center" type="button">
        <i class="i-lc-more-vertical square-6" />
      </button>

      <MenuItem>저장이력</MenuItem>
      <MenuItem>미리보기</MenuItem>
    </Menu>
  </div>
</header>

<Modal size="lg" bind:open>
  <svelte:fragment slot="title">포스트 게시 옵션</svelte:fragment>

  <div class="space-y-6 mt-2">
    <div class="flex gap-6">
      <div class="flex gap-1.5">
        <input name="public" class="square-6" checked type="radio" />
        <label class="grow body-15-sb" for="public">전체 공개</label>
      </div>
      <div class="flex gap-1.5">
        <input name="space" class="square-6" checked type="radio" />
        <label class="grow body-15-sb" for="space">멤버 공개</label>
      </div>
      <div class="flex gap-1.5">
        <input name="unlisted" class="square-6" checked type="radio" />
        <label class="grow body-15-sb" for="unlisted">링크 공개</label>
      </div>
    </div>

    <div class="flex gap-6 items-center">
      <Checkbox class="body-15-sb">비밀글</Checkbox>
      <input class="bg-surface-primary rounded-xl px-3 py-1 body-15-sb h-10" placeholder="비밀번호 입력" type="text" />
    </div>

    <p class="text-secondary">종류 선택</p>

    <div class="flex gap-3">
      <Checkbox class="body-15-sb">트리거 워닝</Checkbox>
      <Checkbox class="body-15-sb">성인물</Checkbox>
    </div>

    <div class="grid grid-cols-4 gap-2">
      <ToggleButton checked size="lg">폭력성</ToggleButton>
      <ToggleButton checked size="lg">잔인성</ToggleButton>
      <ToggleButton checked size="lg">공포성</ToggleButton>
      <ToggleButton checked size="lg">사행성</ToggleButton>
      <ToggleButton checked size="lg">약물/범죄</ToggleButton>
      <ToggleButton checked size="lg">정신질환</ToggleButton>
      <ToggleButton checked size="lg">부적절한 언어</ToggleButton>
      <ToggleButton checked size="lg">기타</ToggleButton>
    </div>

    <p class="text-secondary">세부 설정</p>

    <div class="body-16-b flex gap-6">
      <span>게시물 태그 수정 및 등록</span>

      <div class="flex gap-1.5">
        <input name="space" class="square-6" checked type="radio" />
        <label class="grow body-15-sb" for="space">허용</label>
      </div>
      <div class="flex gap-1.5">
        <input name="space" class="square-6" checked type="radio" />
        <label class="grow body-15-sb" for="space">비허용</label>
      </div>
    </div>

    <div class="body-16-b flex gap-6">
      <span>게시글 피드백</span>

      <div class="flex gap-1.5">
        <input name="space" class="square-6" checked type="radio" />
        <label class="grow body-15-sb" for="space">활성화</label>
      </div>
      <div class="flex gap-1.5">
        <input name="space" class="square-6" checked type="radio" />
        <label class="grow body-15-sb" for="space">비활성화</label>
      </div>
    </div>

    <div class="body-16-b flex gap-6">
      <span>게시글 세부 통계 공개</span>

      <div class="flex gap-1.5">
        <input name="space" class="square-6" checked type="radio" />
        <label class="grow body-15-sb" for="space">허용</label>
      </div>
      <div class="flex gap-1.5">
        <input name="space" class="square-6" checked type="radio" />
        <label class="grow body-15-sb" for="space">비허용</label>
      </div>
    </div>

    <p class="text-secondary">옵션 설정</p>

    <div class="flex gap-3">
      <Checkbox class="body-15-sb">후원 받지 않기</Checkbox>
      <Checkbox class="body-15-sb">알림 받지 않기</Checkbox>
    </div>
  </div>

  <Button
    slot="action"
    class="w-full"
    size="xl"
    on:click={async () => {
      const resp = await revise('PUBLISHED');
      await goto(`/${resp.space.slug}/${resp.permalink}`);
    }}
  >
    게시하기
  </Button>
</Modal>
