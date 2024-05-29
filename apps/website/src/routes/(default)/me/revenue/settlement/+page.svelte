<script lang="ts">
  import dayjs from 'dayjs';
  import IconChevronRight from '~icons/tabler/chevron-right';
  import { graphql } from '$glitch';
  import { Helmet, Icon } from '$lib/components';
  import { Table, TableBody, TableData, TableHead, TableHeader, TableRow } from '$lib/components/table';
  import { revenueWithdrawalState } from '$lib/const/revenue';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import SettlementDetailModal from './SettlementDetailModal.svelte';

  let open = false;

  $: query = graphql(`
    query MeRevenueSettlementPage_Query {
      auth(scope: USER)

      me @_required {
        id

        revenueWithdrawals {
          id
          kind
          state
          createdAt
          paidAmount

          ...MeRevenueSettlementPage_SettlementDetailModal_revenueWithdrawal
        }

        ...MeRevenueSettlementPage_SettlementDetailModal_user
      }
    }
  `);

  let revenueWithdrawal: (typeof $query.me.revenueWithdrawals)[number] | null = null;
</script>

<Helmet description="출금 내역을 확인하세요" title="출금 내역" />

{#if $query.me.revenueWithdrawals.length > 0}
  <div class={css({ marginTop: { base: '8px', sm: '24px' }, overflowX: 'auto', scrollbar: 'hidden' })}>
    <Table>
      <TableHeader>
        <TableRow style={css.raw({ textAlign: 'left' })}>
          <TableHead style={css.raw({ width: '137px' })}>신청일</TableHead>
          <TableHead style={css.raw({ width: '77px' })}>상태</TableHead>
          <TableHead style={css.raw({ truncate: false })}>금액(원)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {#each $query.me.revenueWithdrawals as withdrawal (withdrawal.id)}
          <TableRow>
            <TableData>{dayjs(withdrawal.createdAt).formatAsDateTime()}</TableData>
            <TableData>{revenueWithdrawalState[withdrawal.state]}</TableData>
            <TableData style={css.raw({ truncate: false })}>
              <button
                class={flex({ align: 'center' })}
                type="button"
                on:click={() => {
                  revenueWithdrawal = withdrawal;
                  open = true;
                }}
              >
                {comma(withdrawal.paidAmount)}원
                <Icon icon={IconChevronRight} />
              </button>
            </TableData>
          </TableRow>
        {/each}
      </TableBody>
    </Table>
  </div>
{:else}
  <div class={css({ paddingY: '60px', fontSize: '14px', textAlign: 'center', color: 'gray.500' })}>
    출금된 내역이 없어요
  </div>
{/if}

<SettlementDetailModal $revenueWithdrawal={revenueWithdrawal} $user={$query.me} bind:open />
