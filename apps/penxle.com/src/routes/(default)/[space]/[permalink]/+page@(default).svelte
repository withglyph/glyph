<script lang="ts">
  import { Editor } from '@tiptap/core';
  import dayjs from 'dayjs';
  import { onDestroy, onMount } from 'svelte';
  import { graphql } from '$glitch';
  import { Avatar, Button, Image, Tag } from '$lib/components';
  import { DropCursor, GapCursor, History, Placeholder, TextAlign } from '$lib/tiptap/extensions';
  import { Bold, Italic, Strike, TextColor, Underline } from '$lib/tiptap/marks';
  import { AccessBarrier } from '$lib/tiptap/node-views';
  import { Document, HardBreak, Heading, Paragraph, Text } from '$lib/tiptap/nodes';

  $: query = graphql(`
    query SpacePermalinkPage_Query($permalink: String!) {
      post(permalink: $permalink) {
        id
        permalink
        likeCount
        liked

        space {
          id
          name
          description

          icon {
            id
            ...Image_image
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

  let editor: Editor | undefined;
  let element: HTMLElement;

  onMount(() => {
    editor = new Editor({
      element,
      editable: false,
      content: $query.post.revision.content,
      extensions: [
        // special nodes
        Document,
        Text,

        // nodes
        HardBreak,
        Heading,
        Paragraph,

        // marks
        Bold,
        Italic,
        Strike,
        TextColor,
        Underline,

        // extensions
        DropCursor,
        GapCursor,
        History,
        Placeholder,
        TextAlign,

        // node views
        AccessBarrier,
      ],
      injectCSS: false,
      editorProps: {
        attributes: {
          'data-post-id': $query.post.id,
          'data-revision-id': $query.post.revision.id,
        },
      },
    });
  });

  onDestroy(() => {
    editor?.destroy();
  });

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
</script>

<article class="w-full bg-cardprimary py-17">
  <div class="w-full max-w-187.5 mx-auto space-y-6">
    <header>
      <hgroup class="space-y-4">
        <h1 class="title-32-eb break-all">{$query.post.revision.title}</h1>
        {#if $query.post.revision.subtitle}
          <p class="subtitle-18-sb text-secondary break-all">{$query.post.revision.subtitle}</p>
        {/if}
      </hgroup>

      <div class="border-b w-full flex flex-col mt-6">
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
                1.2천
              </span>
              <span class="flex items-center gap-1">
                <i class="i-px-heart square-3.75" />
                {$query.post.likeCount}
              </span>
              <span class="flex items-center gap-1">
                <i class="i-lc-alarm-clock square-3.75" />
                1분
              </span>
            </div>
          </div>

          <button class="i-lc-bookmark square-6" type="button" />
          <button class="i-lc-share square-6" type="button" />
          <button class="i-lc-more-vertical square-6 text-icon-secondary" type="button" />
        </div>
      </div>
    </header>

    <article bind:this={element} class="bodylong-16-m" />

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
        <p class="subtitle-18-eb mt-4">{$query.post.space.name}</p>
        <p class="body-15-sb text-secondary my-2">{$query.post.space.description}</p>
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
