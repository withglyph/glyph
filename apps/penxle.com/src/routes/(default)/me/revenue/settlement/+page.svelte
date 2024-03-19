<script lang="ts">
  import IconChevronRight from '~icons/tabler/chevron-right';
  import { Helmet, Icon } from '$lib/components';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import SettlementDetailModal from './SettlementDetailModal.svelte';

  let open = false;
</script>

<Helmet description="출금 내역을 확인하세요" title="출금 내역" />

<table class={css({ borderSpacing: '60px', width: 'full' })}>
  <thead>
    <tr
      class={css({
        fontSize: '14px',
        fontWeight: 'medium',
        textAlign: 'left',
        borderBottomWidth: '1px',
        borderBottomColor: 'gray.150',
      })}
    >
      <th class={css({ paddingTop: '20px', paddingBottom: '12px', width: { base: '124px', sm: '170px' } })}>일시</th>
      <th class={css({ paddingTop: '20px', paddingBottom: '12px', width: { base: '48px', sm: '94px' } })}>유형</th>
      <th class={css({ paddingTop: '20px', paddingBottom: '12px', width: { base: '67px', sm: '112px' } })}>상태</th>
      <th class={css({ paddingTop: '20px', paddingBottom: '12px' })}>금액(원)</th>
    </tr>
  </thead>
  <tbody>
    <tr
      class={css({
        borderBottomWidth: '1px',
        borderColor: 'gray.100',
        _lastOfType: { borderStyle: 'none' },
      })}
    >
      <td class={css({ paddingY: '24px', fontSize: '14px', fontWeight: 'light', color: 'gray.500' })}>
        2024.02.12. 11:04
      </td>
      <td class={css({ paddingY: '24px', fontSize: '14px' })}>자동</td>
      <td class={css({ paddingY: '24px', fontSize: '14px' })}>대기중</td>
      <td class={css({ paddingY: '24px', fontSize: '14px', fontWeight: 'semibold' })}>
        <button class={flex({ align: 'center' })} type="button" on:click={() => (open = true)}>
          {comma(1_000_000)}원
          <Icon icon={IconChevronRight} />
        </button>
      </td>
    </tr>
  </tbody>
</table>

<!-- <div class={css({ paddingY: '40px', fontWeight: 'semibold', textAlign: 'center', color: 'gray.400' })}>
  출금된 내역이 없어요
</div> -->

<SettlementDetailModal bind:open />
