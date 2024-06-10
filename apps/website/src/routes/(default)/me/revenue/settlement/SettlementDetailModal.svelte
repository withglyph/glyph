<script lang="ts">
  import dayjs from 'dayjs';
  import IconHelpLine from '~icons/glyph/help-line';
  import { fragment, graphql } from '$glitch';
  import { Chip, Icon, Modal, Tooltip } from '$lib/components';
  import { banks, revenueWithdrawalState } from '$lib/const/revenue';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type {
    MeRevenueSettlementPage_SettlementDetailModal_revenueWithdrawal,
    MeRevenueSettlementPage_SettlementDetailModal_user,
  } from '$glitch';

  export let open = false;

  let _user: MeRevenueSettlementPage_SettlementDetailModal_user;
  let _revenueWithdrawal: MeRevenueSettlementPage_SettlementDetailModal_revenueWithdrawal | null = null;
  export { _revenueWithdrawal as $revenueWithdrawal, _user as $user };

  $: user = fragment(
    _user,
    graphql(`
      fragment MeRevenueSettlementPage_SettlementDetailModal_user on User {
        id

        settlementIdentity {
          id
          bankAccountHolderName
        }
      }
    `),
  );

  $: revenueWithdrawal = fragment(
    _revenueWithdrawal,
    graphql(`
      fragment MeRevenueSettlementPage_SettlementDetailModal_revenueWithdrawal on RevenueWithdrawal {
        id
        createdAt
        bankCode
        bankAccountNumber
        kind
        state
        revenueAmount
        serviceFeeAmount
        taxAmount
        paidAmount
      }
    `),
  );
</script>

<Modal titleStyle={css.raw({ justifyContent: 'center', marginX: '32px' })} bind:open>
  <svelte:fragment slot="title">출금 상세 정보</svelte:fragment>

  {#if $revenueWithdrawal}
    <div class={css({ paddingBottom: '60px' })}>
      <div
        class={css({
          _after: {
            content: '""',
            display: 'block',
            marginX: '-20px',
            height: '8px',
            backgroundColor: 'gray.50',
          },
        })}
      >
        <div class={flex({ align: 'center', gap: '6px' })}>
          <p class={css({ fontSize: '13px', fontWeight: 'semibold' })}>{$revenueWithdrawal?.id.toUpperCase()}</p>
          <Chip
            color={$revenueWithdrawal.state === 'SUCCESS'
              ? 'grass'
              : $revenueWithdrawal.state === 'PENDING'
                ? 'violet'
                : 'red'}
            variant="fill"
          >
            {revenueWithdrawalState[$revenueWithdrawal.state]}
          </Chip>
        </div>
        <time class={css({ marginTop: '2px', fontSize: '12px', color: 'gray.500' })}>
          {dayjs($revenueWithdrawal?.createdAt).formatAsDateTime()}
        </time>

        <div
          class={flex({
            align: 'center',
            gap: '2px',
            marginTop: '10px',
            marginBottom: '20px',
            borderWidth: '1px',
            borderColor: 'gray.100',
            paddingX: '12px',
            paddingY: '14px',
            fontSize: '13px',
            color: 'gray.500',
          })}
        >
          지급 계좌:
          {banks[$revenueWithdrawal?.bankCode ?? '']}
          {$revenueWithdrawal?.bankAccountNumber}
          ({$user.settlementIdentity?.bankAccountHolderName})
        </div>
      </div>

      <div class={css({ paddingY: '16px' })}>
        <p
          class={css({
            borderBottomWidth: '1px',
            borderColor: 'gray.100',
            paddingX: '12px',
            paddingBottom: '8px',
            fontSize: { base: '15px', sm: '16px' },
            fontWeight: 'semibold',
          })}
        >
          출금
        </p>
        <dl class={css({ fontSize: '14px' })}>
          <div
            class={flex({
              align: 'center',
              gap: '16px',
              borderBottomWidth: '1px',
              borderColor: 'gray.100',
              paddingX: '12px',
              paddingY: '14px',
            })}
          >
            <dt class={css({ width: '120px' })}>출금 신청 금액</dt>
            <dd class={css({ fontWeight: 'semibold' })}>{comma($revenueWithdrawal.revenueAmount)}원</dd>
          </div>
          <div
            class={flex({
              align: 'center',
              gap: '16px',
              borderBottomWidth: '1px',
              borderColor: 'gray.100',
              paddingX: '12px',
              paddingY: '14px',
            })}
          >
            <dt class={css({ width: '120px' })}>서비스 이용료</dt>
            <dd class={css({ fontWeight: 'semibold' })}>무료</dd>
          </div>
          <div
            class={flex({
              align: 'center',
              gap: '16px',
              borderBottomWidth: '1px',
              borderColor: 'gray.100',
              paddingX: '12px',
              paddingY: '14px',
            })}
          >
            <dt class={flex({ align: 'center', gap: '2px', width: '120px' })}>
              출금 수수료
              <Tooltip message="출금에 필요한 금융망 이용료" offset={10} placement="top">
                <Icon style={css.raw({ 'color': 'gray.400', '& *': { strokeWidth: '[1]' } })} icon={IconHelpLine} />
              </Tooltip>
            </dt>
            <dd class={css({ fontWeight: 'semibold' })}>{comma(1000)}원</dd>
          </div>
        </dl>
      </div>

      <div class={css({ paddingTop: '16px' })}>
        <p
          class={css({
            borderBottomWidth: '1px',
            borderColor: 'gray.100',
            paddingX: '12px',
            paddingBottom: '8px',
            fontSize: { base: '15px', sm: '16px' },
            fontWeight: 'semibold',
          })}
        >
          최종 지급 금액
        </p>
        <dl class={css({ fontSize: '14px', backgroundColor: 'gray.100' })}>
          <div
            class={flex({
              align: 'center',
              gap: '16px',
              paddingX: '12px',
              paddingY: '14px',
            })}
          >
            <dt class={css({ width: '120px' })}>최종 지급 금액</dt>
            <dd class={css({ fontWeight: 'semibold' })}>{comma($revenueWithdrawal.paidAmount)}원</dd>
          </div>
        </dl>
      </div>
    </div>
  {/if}
</Modal>
