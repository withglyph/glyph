<script lang="ts">
  import { Editor } from '@tiptap/core';
  import dayjs from 'dayjs';
  import { onDestroy, onMount } from 'svelte';
  import { graphql } from '$glitch';
  import { Avatar } from '$lib/components';
  import { DropCursor, GapCursor, History, Placeholder, TextAlign } from '$lib/tiptap/extensions';
  import { Bold, Italic, Strike, TextColor, Underline } from '$lib/tiptap/marks';
  import { AccessBarrier } from '$lib/tiptap/node-views';
  import { Document, HardBreak, Heading, Paragraph, Text } from '$lib/tiptap/nodes';
  import type { JSONContent } from '@tiptap/core';

  $: query = graphql(`
    query SpacePermalinkPage_Query($permalink: String!) {
      post(permalink: $permalink) {
        id
        permalink

        space {
          id
          name
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

  $: content = $query.post.revision.content as JSONContent;

  onMount(() => {
    editor = new Editor({
      editable: false,
      element,
      content,
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
    });
  });

  onDestroy(() => {
    editor?.destroy();
  });
</script>

<article>
  <header>
    <hgroup class="pt-12 mx-auto w-3xl">
      <h1 class="mt-2 w-full text-3xl font-semibold">{$query.post.revision.title}</h1>
      {#if $query.post.revision.subtitle}
        <p class="mt-2 w-full text-lg">{$query.post.revision.subtitle}</p>
      {/if}
    </hgroup>
    <div class="border-b w-full flex flex-col">
      <div class="flex items-center gap-1">
        <Avatar class="square-6" $profile={$query.post.member.profile} />
        <p>{$query.post.member.profile.name}</p>
      </div>
      <p>{dayjs($query.post.revision.createdAt).formatAsDate()}</p>
    </div>
  </header>
  <article bind:this={element} />
</article>
