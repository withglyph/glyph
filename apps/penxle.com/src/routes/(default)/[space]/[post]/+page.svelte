<script lang="ts">
  import { computePosition, flip, offset, shift } from '@floating-ui/dom';
  import { isMarkActive } from '@tiptap/core';
  import dayjs from 'dayjs';
  import { onDestroy, onMount, tick } from 'svelte';
  import { graphql } from '$glitch';
  import { Avatar, Button, Image, Tag } from '$lib/components';
  import { toast } from '$lib/notification';
  import { portal } from '$lib/svelte/actions';
  import { TiptapRenderer } from '$lib/tiptap/components';
  import { humanizeNumber } from '$lib/utils';
  import LoginRequireModal from '../../LoginRequireModal.svelte';
  import { TextTip } from './text-tip';
  import type { Editor } from '@tiptap/core';

  let open = false;
  let targetEl: HTMLButtonElement;
  let menuEl: HTMLUListElement;
  let editor: Editor | undefined;
  let loginRequireOpen = false;
  let tiptapRendererEl: HTMLElement;
  let createHighlightTooltip: TextTip | undefined;
  let editHighlightTooltip: TextTip | undefined;

  $: query = graphql(`
    query SpacePostPage_Query($permalink: String!) {
      me {
        id
      }

      post(permalink: $permalink) {
        id
        permalink
        likeCount
        liked
        viewCount

        space {
          id
          name
          description
          muted

          icon {
            id
            ...Image_image
          }

          meAsMember {
            id
          }
        }

        member {
          id

          profile {
            id
            name
            ...Avatar_profile
          }
        }

        revision {
          id
          title
          subtitle
          content
          createdAt
        }
      }
    }
  `);

  const update = async () => {
    await tick();

    const position = await computePosition(targetEl, menuEl, {
      placement: 'right',
      middleware: [offset(4), flip(), shift({ padding: 8 })],
    });

    Object.assign(menuEl.style, {
      left: `${position.x}px`,
      top: `${position.y}px`,
    });
  };

  $: if (open) {
    void update();
  }

  const updatePostView = graphql(`
    mutation SpacePostPage_UpdatePostViewMutation($input: UpdatePostViewInput!) {
      updatePostView(input: $input)
    }
  `);

  const likePost = graphql(`
    mutation SpacePostPage_LikePostMutation($input: LikePostInput!) {
      likePost(input: $input) {
        id
        liked
        likeCount
      }
    }
  `);

  const unlikePost = graphql(`
    mutation SpacePostPage_UnlikePostMutation($input: UnlikePostInput!) {
      unlikePost(input: $input) {
        id
        liked
        likeCount
      }
    }
  `);

  const muteSpace = graphql(`
    mutation SpacePostPage_MuteSpaceMutation($input: MuteSpaceInput!) {
      muteSpace(input: $input) {
        id
        muted
      }
    }
  `);

  const unmuteSpace = graphql(`
    mutation SpacePostPage_UnmuteSpaceMutation($input: UnmuteSpaceInput!) {
      unmuteSpace(input: $input) {
        id
        muted
      }
    }
  `);

  onMount(() => {
    updatePostView({ postId: $query.post.id });
  });

  const shareButton = {
    title: '공유',
    callback: () => {
      //
    },
  };

  $: if (tiptapRendererEl) {
    editHighlightTooltip = new TextTip({
      scope: tiptapRendererEl,
      manualShow: true,
      buttons: [
        {
          title: '지우기',
          callback: () => {
            if (!editor) throw new Error('editor is not initialized');
            // TODO: 밑줄 지우기
          },
        },
        shareButton,
      ],
    });

    createHighlightTooltip = new TextTip({
      scope: tiptapRendererEl,
      buttons: [
        {
          title: '밑줄',
          callback: () => {
            if (!editor) throw new Error('editor is not initialized');
            const { state } = editor.view;
            const { empty } = state.selection;

            if (empty) return;

            editor.commands.setHighlight();
            createHighlightTooltip?.hide();
          },
        },
        shareButton,
      ],
    });
  }

  function showEditHighlightTooltip({ editor }: { editor: Editor }) {
    if (!editHighlightTooltip) throw new Error('editHighlightTooltip is not initialized');

    if (isMarkActive(editor.state, 'highlight')) {
      editHighlightTooltip.manualShow();
    } else {
      editHighlightTooltip.hide();
    }
  }

  $: if (editor) {
    editor.on('selectionUpdate', showEditHighlightTooltip);
  }

  onDestroy(() => {
    createHighlightTooltip?.destroyEvents();
    editHighlightTooltip?.destroyEvents();

    editor?.off('selectionUpdate', showEditHighlightTooltip);
  });
</script>

<article class="w-full bg-cardprimary py-7.5 px-4 sm:py-17">
  <div class="w-full max-w-187.5 mx-auto space-y-6">
    <header>
      <hgroup class="space-y-4">
        <h1 class="title-24-eb break-all sm:title-32-eb">{$query.post.revision.title}</h1>
        {#if $query.post.revision.subtitle}
          <p class="body-16-sb text-secondary break-all sm:subtitle-18-sb">{$query.post.revision.subtitle}</p>
        {/if}
      </hgroup>

      <div class="border-b border-secondary w-full flex flex-col mt-4.75 sm:mt-6">
        <div class="flex items-center pt-4 pb-5 gap-3">
          <div class="relative">
            <Image class="square-10.5 rounded-3.5" $image={$query.post.space.icon} />
            <Avatar
              class="square-6 absolute border border-bg-primary -right-1 -bottom-1"
              $profile={$query.post.member.profile}
            />
          </div>
          <div class="grow-1">
            <p class="body-15-b">{$query.post.space.name} · {$query.post.member.profile.name}</p>
            <div class="flex items-center gap-3.5 body-13-m text-secondary">
              <span>{dayjs($query.post.revision.createdAt).formatAsDate()}</span>
              <span class="flex items-center gap-1">
                <i class="i-lc-eye square-3.75" />
                {humanizeNumber($query.post.viewCount)}
              </span>
              <span class="flex items-center gap-1">
                <i class="i-px-heart square-3.75" />
                {humanizeNumber($query.post.likeCount)}
              </span>
              <span class="flex items-center gap-1">
                <i class="i-lc-alarm-clock square-3.75" />
                1분
              </span>
            </div>
          </div>

          <button class="i-lc-bookmark square-6 <sm:hidden" type="button" />
          <button class="i-lc-share square-6 <sm:hidden" type="button" />
          <button
            bind:this={targetEl}
            class="i-lc-more-vertical square-6 text-icon-secondary"
            type="button"
            on:click={() => (open = true)}
          />

          {#if open}
            <div
              class="fixed inset-0 z-49"
              role="button"
              tabindex="-1"
              on:click={() => (open = false)}
              on:keypress={null}
              use:portal
            />

            <ul
              bind:this={menuEl}
              class="absolute z-50 w-64 flex flex-col border rounded bg-white p-2 shadow space-y-1"
              use:portal
            >
              {#if !$query.post.space.meAsMember}
                {#if $query.post.space.muted}
                  <li>
                    <button
                      class="w-full px-4 py-3 rounded-lg body-14-m text-disabled hover:(body-14-sb text-primary bg-primary)"
                      type="button"
                      on:click={async () => {
                        await unmuteSpace({ spaceId: $query.post.space.id });
                        toast.success('스페이스 숨기기를 해제했어요');
                        open = false;
                      }}
                    >
                      스페이스 숨기기 해제
                    </button>
                  </li>
                {:else}
                  <li>
                    <button
                      class="w-full px-4 py-3 rounded-lg body-14-m text-disabled hover:(body-14-sb text-primary bg-primary)"
                      type="button"
                      on:click={async () => {
                        if (!$query.me) {
                          loginRequireOpen = true;
                          return;
                        }

                        await muteSpace({ spaceId: $query.post.space.id });
                        toast.success('스페이스를 숨겼어요');
                        open = false;
                      }}
                    >
                      스페이스 숨기기
                    </button>
                  </li>
                {/if}
              {/if}
            </ul>
          {/if}
        </div>
      </div>
    </header>

    <TiptapRenderer
      class="bodylong-16-m"
      content={$query.post.revision.content}
      bind:editor
      bind:element={tiptapRendererEl}
    />

    <div class="flex gap-2 flex-wrap">
      <Tag size="sm">#일러스트</Tag>
      <Tag size="sm">#만화</Tag>
      <Tag size="sm">#소설</Tag>
      <Tag size="sm">#사이트</Tag>
      <Button class="rounded-12! px-4!" color="tertiary" size="sm" variant="outlined">
        <i class="i-lc-plus square-4" />
      </Button>
    </div>
    <div class="flex items-center gap-2.5 flex-wrap mt-4!">
      <button class="square-6 flex center rounded-lg border border-secondary hover:border-primary" type="button">
        <i class="i-lc-plus square-3.5" />
      </button>
      <span class="h-6">🐱</span>
      <span class="h-6">🤞🏻</span>
    </div>

    <hr class="w-full border-color-alphagray-10" />

    <div class="mt-2! flex items-center justify-between py-2">
      <Button
        class="rounded-12! px-3! h-6!"
        color="tertiary"
        size="sm"
        variant="outlined"
        on:click={async () => {
          await ($query.post.liked ? unlikePost({ postId: $query.post.id }) : likePost({ postId: $query.post.id }));
        }}
      >
        {#if $query.post.liked}
          <i class="i-px-heart-fill square-4 mr-1 text-red-50" />
        {:else}
          <i class="i-px-heart square-4 mr-1" />
        {/if}
        <span class="body-15-b">{$query.post.likeCount}</span>
      </Button>

      <div>
        <button class="i-lc-bookmark square-6 mr-3" type="button" />
        <button class="i-lc-share square-6" type="button" />
      </div>
    </div>

    <div class="bg-primary rounded-3xl">
      <div class="flex flex-col w-full center px-4 pb-4 mt-9">
        <Image class="square-15 rounded-2xl -mt-7.5" $image={$query.post.space.icon} />
        <p class="subtitle-18-eb mt-4 truncate w-full text-center">
          {$query.post.space.name}
        </p>
        <p class="body-15-sb text-secondary my-2 truncate text-center w-full">
          {$query.post.space.description}
        </p>
        <Button class="rounded-12!" color="tertiary" size="md" variant="outlined">
          <i class="i-lc-bell square-5" />
          <span class="mx-2">알림받는중</span>
          <i class="i-lc-chevron-down square-5" />
        </Button>
      </div>
      <div />
    </div>
  </div>
</article>

<LoginRequireModal bind:open={loginRequireOpen} />
