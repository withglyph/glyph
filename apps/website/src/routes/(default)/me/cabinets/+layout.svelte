<script lang="ts">
  import { TabHead, TabHeadItem } from '$lib/components/tab';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
</script>

<h1 class={css({ marginBottom: '12px', fontSize: '24px', fontWeight: 'bold', hideBelow: 'sm' })}>보관함</h1>

<TabHead
  style={css.raw({
    gap: '31px',
    smDown: {
      position: 'sticky',
      top: '116px',
      paddingX: '20px',
      paddingY: '12px',
      width: 'full',
      backgroundColor: 'gray.0',
      overflowX: 'auto',
      scrollbar: 'hidden',
      zIndex: '50',
    },
    sm: { paddingBottom: '0' },
  })}
>
  <TabHeadItem id={1} pathname="/me/cabinets">북마크</TabHeadItem>
  <TabHeadItem id={2} pathname="/me/cabinets/purchased">구매</TabHeadItem>
  <TabHeadItem id={3} pathname="/me/cabinets/recent">최근</TabHeadItem>
  <TabHeadItem id={4} pathname="/me/cabinets/emojis">이모지</TabHeadItem>
  <TabHeadItem id={5} pathname="/me/cabinets/comments">댓글</TabHeadItem>
</TabHead>

<div class={flex({ direction: 'column', grow: '1', smDown: { paddingX: '20px' } })}>
  <slot />
</div>
