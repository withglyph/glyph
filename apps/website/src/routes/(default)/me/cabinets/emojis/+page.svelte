<script lang="ts">
  import * as EmojiMart from 'emoji-mart';
  import { onMount } from 'svelte';
  import { graphql } from '$glitch';
  import { Helmet } from '$lib/components';
  import { emojiData } from '$lib/emoji';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import EmojiReactedPost from './EmojiReactedPost.svelte';

  $: query = graphql(`
    query MeCabinetsEmojisPage_Query {
      auth(scope: USER)

      me @_required {
        id

        emojiReactedPosts {
          id
          ...MeCabinetsEmojisPage_EmojiReactedPost_post
        }
      }

      ...MeCabinetsEmojisPage_EmojiReactedPost_query
    }
  `);

  onMount(() => {
    EmojiMart.init({ data: emojiData });
  });
</script>

<Helmet description="이모지 반응을 남긴 포스트 목록을 둘러보세요" title="반응을 남긴 포스트" />

<p class={css({ paddingTop: '12px', paddingBottom: '10px', fontSize: '12px', color: 'gray.500' })}>
  총 {$query.me.emojiReactedPosts.length}개의 포스트
</p>

<ul class={flex({ direction: 'column', flexGrow: '1' })}>
  {#each $query.me.emojiReactedPosts as post (post.id)}
    <li
      class={css({
        borderTopWidth: '1px',
        borderTopColor: 'gray.100',
        _firstOfType: { 'borderStyle': 'none', '& > div > a': { paddingTop: '0' } },
      })}
    >
      <EmojiReactedPost $post={post} {$query} />
    </li>
  {:else}
    <li class={css({ marginY: 'auto', paddingY: '60px', fontSize: '14px', color: 'gray.500', textAlign: 'center' })}>
      이모지를 남긴 포스트가 없어요
    </li>
  {/each}
</ul>
