<script lang="ts">
  import { TabHead, TabHeadItem } from '$lib/components/tab';
  import { css } from '$styled-system/css';
</script>

<h1 class={css({ marginBottom: '12px', fontSize: '24px', fontWeight: 'bold', hideBelow: 'sm' })}>리딤코드</h1>

<TabHead style={css.raw({ gap: '28px', smDown: { paddingX: '20px', paddingY: '12px' }, sm: { paddingBottom: '0' } })}>
  <TabHeadItem id={1} pathname="/me/redeem">코드등록</TabHeadItem>
  <TabHeadItem id={2} pathname="/me/redeem/history">사용내역</TabHeadItem>
</TabHead>

<slot />
