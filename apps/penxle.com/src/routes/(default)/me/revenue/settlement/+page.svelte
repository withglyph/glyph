<script lang="ts">
  import dayjs from 'dayjs';
  import IconChevronRight from '~icons/tabler/chevron-right';
  import { graphql } from '$glitch';
  import { Helmet, Icon } from '$lib/components';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import SettlementDetailModal from './SettlementDetailModal.svelte';
  import type { RevenueWithdrawalKind, RevenueWithdrawalState } from '$glitch';

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

  const revenueWithdrawalKind: Record<RevenueWithdrawalKind, string> = {
    INSTANT: '즉시',
    MONTHLY: '자동',
  };

  const revenueWithdrawalState: Record<RevenueWithdrawalState, string> = {
    FAILED: '지급실패',
    PENDING: '대기중',
    SUCCESS: '지급완료',
  };

  let revenueWithdrawal: (typeof $query.me.revenueWithdrawals)[number] | null = null;
</script>

<Helmet description="출금 내역을 확인하세요" title="출금 내역" />

{#if $query.me.revenueWithdrawals.length > 0}
  <table class={css({ borderSpacing: '0', width: 'full' })}>
    <thead>
      <tr
        class={css({
          fontSize: '14px',
          fontWeight: 'medium',
          textAlign: 'left',
        })}
      >
        <th
          class={css({
            borderBottomWidth: '1px',
            borderBottomColor: 'gray.150',
            paddingTop: '20px',
            paddingBottom: '12px',
            width: { base: '124px', sm: '170px' },
          })}
        >
          일시
        </th>
        <th
          class={css({
            borderBottomWidth: '1px',
            borderBottomColor: 'gray.150',
            paddingTop: '20px',
            paddingBottom: '12px',
            width: { base: '48px', sm: '94px' },
          })}
        >
          유형
        </th>
        <th
          class={css({
            borderBottomWidth: '1px',
            borderBottomColor: 'gray.150',
            paddingTop: '20px',
            paddingBottom: '12px',
            width: { base: '67px', sm: '112px' },
          })}
        >
          상태
        </th>
        <th
          class={css({
            borderBottomWidth: '1px',
            borderBottomColor: 'gray.150',
            paddingTop: '20px',
            paddingBottom: '12px',
          })}
        >
          금액(원)
        </th>
      </tr>
    </thead>
    <tbody>
      {#each $query.me.revenueWithdrawals as withdrawal (withdrawal.id)}
        <tr
          class={css({
            _lastOfType: { '& > td': { borderStyle: 'none' } },
          })}
        >
          <td
            class={css({
              borderBottomWidth: '1px',
              borderColor: 'gray.100',
              paddingY: '24px',
              fontSize: '14px',
              fontWeight: 'light',
              color: 'gray.500',
            })}
          >
            {dayjs(withdrawal.createdAt).formatAsDateTime()}
          </td>
          <td class={css({ borderBottomWidth: '1px', borderColor: 'gray.100', paddingY: '24px', fontSize: '14px' })}>
            {revenueWithdrawalKind[withdrawal.kind]}
          </td>
          <td class={css({ borderBottomWidth: '1px', borderColor: 'gray.100', paddingY: '24px', fontSize: '14px' })}>
            {revenueWithdrawalState[withdrawal.state]}
          </td>
          <td
            class={css({
              borderBottomWidth: '1px',
              borderColor: 'gray.100',
              paddingY: '24px',
              fontSize: '14px',
              fontWeight: 'semibold',
            })}
          >
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
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{:else}
  <div class={css({ paddingY: '40px', fontWeight: 'semibold', textAlign: 'center', color: 'gray.400' })}>
    출금된 내역이 없어요
  </div>
{/if}

<SettlementDetailModal $revenueWithdrawal={revenueWithdrawal} $user={$query.me} bind:open />
