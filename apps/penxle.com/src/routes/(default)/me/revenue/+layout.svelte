<script lang="ts">
  import { onMount } from 'svelte';
  import { graphql } from '$glitch';
  import { TabHead, TabHeadItem } from '$lib/components/tab';
  import { pageSubTitle } from '$lib/stores';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

  onMount(async () => {
    pageSubTitle.set('수익/정산');
  });

  $: query = graphql(`
    query RevenueLayout_Query {
      auth(scope: USER)

      me @_required {
        id
        revenue
      }
    }
  `);
</script>

<h1 class={css({ fontSize: '20px', fontWeight: 'bold', smDown: { paddingTop: '16px', paddingX: '20px' } })}>
  수익/정산
</h1>

<div
  class={flex({
    direction: 'column',
    borderWidth: '1px',
    borderColor: 'gray.200',
    borderRadius: '16px',
    marginTop: '24px',
    paddingY: '16px',
    backgroundColor: 'white',
    smDown: { paddingX: '20px' },
  })}
>
  <div class={flex({ direction: 'column', gap: '8px', paddingTop: '8px', paddingX: '32px' })}>
    <div class={flex({ gap: '8px', paddingY: '8px' })}>
      <div class={css({ flex: '1', fontSize: '18px', fontWeight: 'bold' })}>누적 수익금</div>
      <div class={css({ fontSize: '18px', fontWeight: 'bold' })}>{comma(0)}원</div>
    </div>
  </div>
  <div class={flex({ direction: 'column', gap: '8px', paddingTop: '8px', paddingX: '32px' })}>
    <div class={css({ width: 'full', height: '1px', backgroundColor: 'black/10' })} />
    <div class={flex({ gap: '8px', paddingY: '8px' })}>
      <div class={css({ flex: '1', fontSize: '18px', fontWeight: 'bold' })}>누적 정산액</div>
      <div class={css({ fontSize: '18px', fontWeight: 'bold' })}>{comma(0)}원</div>
    </div>
  </div>
  <div class={flex({ direction: 'column', gap: '8px', paddingTop: '8px', paddingX: '32px' })}>
    <div class={css({ width: 'full', height: '1px', backgroundColor: 'black/10' })} />
    <div class={flex({ gap: '8px', paddingY: '8px' })}>
      <div class={css({ flex: '1', fontSize: '18px', fontWeight: 'bold' })}>지급 대기</div>
      <div class={css({ fontSize: '18px', fontWeight: 'bold' })}>{comma(0)}원</div>
    </div>
  </div>
  <div class={flex({ direction: 'column', gap: '8px', paddingTop: '8px', paddingX: '32px' })}>
    <div class={css({ width: 'full', height: '1px', backgroundColor: 'black/10' })} />
    <div class={flex({ gap: '8px', paddingY: '8px' })}>
      <div class={css({ flex: '1', fontSize: '18px', fontWeight: 'bold' })}>정산 가능</div>
      <div class={css({ fontSize: '18px', fontWeight: 'bold' })}>{comma($query.me.revenue)}원</div>
    </div>
  </div>
</div>

<div
  class={flex({
    direction: 'column',
    gap: '16px',
    borderWidth: '1px',
    borderColor: 'gray.200',
    borderRadius: '16px',
    marginTop: '24px',
    paddingY: '32px',
    backgroundColor: 'white',
    smDown: {
      marginX: '20px',
      marginBottom: '16px',
    },
  })}
>
  <h2 class={css({ paddingX: '24px', fontSize: '20px', fontWeight: 'bold' })}>수익/정산 내역</h2>

  <TabHead style={css.raw({ paddingX: '24px', width: 'full' })} variant="secondary">
    <TabHeadItem id={1} pathname="/me/revenue">수익</TabHeadItem>
    <TabHeadItem id={2} pathname="/me/revenue/settlement">정산</TabHeadItem>
  </TabHead>
  <div class={css({ paddingX: '24px' })}>
    <slot />
  </div>
</div>
