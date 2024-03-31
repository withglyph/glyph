<script lang="ts">
  import { graphql } from '$glitch';
  import { TabHead, TabHeadItem } from '$lib/components/tab';
  import { css } from '$styled-system/css';

  $: query = graphql(`
    query FeedLayout_Query {
      me {
        id
      }
    }
  `);
</script>

<div
  class={css({
    display: 'flex',
    justifyContent: 'center',
    flexGrow: '1',
    paddingBottom: { base: '92px', sm: '120px' },
    width: 'full',
    backgroundColor: 'gray.5',
  })}
>
  <div class={css({ paddingX: '20px', width: 'full', maxWidth: '1280px' })}>
    <TabHead>
      <TabHeadItem id={1} pathname="/">추천</TabHeadItem>
      {#if $query.me}
        <!-- 구독 페이지로 이동 -->
        <TabHeadItem id={2} pathname="/feed/recent">구독</TabHeadItem>
      {/if}
    </TabHead>

    <slot />
  </div>
</div>
