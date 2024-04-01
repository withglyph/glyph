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
    flexDirection: 'column',
    justifyContent: 'center',
    flexGrow: '1',
    paddingBottom: { base: '92px', sm: '120px' },
    width: 'full',
    backgroundColor: 'gray.5',
  })}
>
  <TabHead
    style={css.raw({ marginX: 'auto', paddingX: '20px', paddingBottom: '20px', width: 'full', maxWidth: '1280px' })}
  >
    <TabHeadItem id={1} pathname="/">추천</TabHeadItem>
    {#if $query.me}
      <TabHeadItem id={2} pathname="/feed/subscribes">구독</TabHeadItem>
    {/if}
  </TabHead>

  <slot />
</div>
