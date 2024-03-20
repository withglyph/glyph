<script lang="ts">
  import dayjs from 'dayjs';
  import IconInfoCircle from '~icons/tabler/alert-circle';
  import { fragment, graphql } from '$glitch';
  import { Icon, Tooltip } from '$lib/components';
  import { Modal } from '$lib/components/v2';
  import { banks } from '$lib/const/revenue';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type {
    MeRevenueSettlementPage_SettlementDetailModal_revenueWithdrawal,
    MeRevenueSettlementPage_SettlementDetailModal_user,
    RevenueWithdrawalKind,
    RevenueWithdrawalState,
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

  const revenueWithdrawalKind: Record<RevenueWithdrawalKind, string> = {
    INSTANT: '즉시출금',
    MONTHLY: '자동출금',
  };

  const revenueWithdrawalState: Record<RevenueWithdrawalState, string> = {
    FAILED: '지급실패',
    PENDING: '대기중',
    SUCCESS: '지급완료',
  };
</script>

<Modal titleStyle={css.raw({ justifyContent: 'center', marginX: '32px' })} bind:open>
  <svelte:fragment slot="title">출금 상세 정보</svelte:fragment>

  {#if $revenueWithdrawal}
    <div class={css({ paddingTop: '24px', paddingBottom: { base: '60px', sm: '24px' }, paddingX: '20px' })}>
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
        <p class={css({ fontWeight: 'semibold' })}>{$revenueWithdrawal?.id.toUpperCase()}</p>
        <time class={css({ marginTop: '5px', fontSize: '14px', color: 'gray.500' })}>
          {dayjs($revenueWithdrawal?.createdAt).formatAsDateTime()}
        </time>

        <div
          class={flex({
            align: 'center',
            gap: '2px',
            marginY: '12px',
            paddingX: '10px',
            paddingY: '8px',
            borderRadius: '6px',
            fontSize: '13px',
            color: 'gray.500',
            backgroundColor: 'gray.50',
          })}
        >
          <span>{banks[$revenueWithdrawal?.bankCode ?? '']} {$revenueWithdrawal?.bankAccountNumber}</span>
          <span>({$user.settlementIdentity?.bankAccountHolderName})</span>
        </div>
      </div>

      <div class={css({ marginTop: '16px' })}>
        <p
          class={css({
            borderBottomWidth: '1px',
            borderColor: 'gray.300',
            paddingX: '10px',
            paddingY: '8px',
            fontSize: '18px',
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
              paddingX: '10px',
              paddingY: '14px',
            })}
          >
            <dt class={css({ width: '120px' })}>유형</dt>
            <dd class={css({ fontWeight: 'semibold' })}>{revenueWithdrawalKind[$revenueWithdrawal.kind]}</dd>
          </div>
          <div
            class={flex({
              align: 'center',
              gap: '16px',
              borderBottomWidth: '1px',
              borderColor: 'gray.100',
              paddingX: '10px',
              paddingY: '14px',
            })}
          >
            <dt class={css({ width: '120px' })}>상태</dt>
            <dd class={css({ fontWeight: 'semibold' })}>{revenueWithdrawalState[$revenueWithdrawal.state]}</dd>
          </div>
          <div
            class={flex({
              align: 'center',
              gap: '16px',
              borderBottomWidth: '1px',
              borderColor: 'gray.100',
              paddingX: '10px',
              paddingY: '14px',
            })}
          >
            <dt class={css({ width: '120px' })}>신청금액</dt>
            <dd class={css({ fontWeight: 'semibold' })}>{comma($revenueWithdrawal.revenueAmount)}원</dd>
          </div>
        </dl>
      </div>

      <div class={css({ marginTop: '24px' })}>
        <p
          class={css({
            borderBottomWidth: '1px',
            borderColor: 'gray.300',
            paddingX: '10px',
            paddingY: '8px',
            fontSize: '18px',
            fontWeight: 'semibold',
          })}
        >
          공제내역
        </p>
        <dl class={css({ fontSize: '14px' })}>
          <div
            class={flex({
              align: 'center',
              gap: '16px',
              borderBottomWidth: '1px',
              borderColor: 'gray.100',
              paddingX: '10px',
              paddingY: '14px',
            })}
          >
            <dt class={css({ width: '120px' })}>서비스 이용료</dt>
            <dd class={css({ fontWeight: 'semibold' })}>{comma($revenueWithdrawal.serviceFeeAmount)}원</dd>
          </div>
          {#if $revenueWithdrawal.kind === 'INSTANT'}
            <div
              class={flex({
                align: 'center',
                gap: '16px',
                borderBottomWidth: '1px',
                borderColor: 'gray.100',
                paddingX: '10px',
                paddingY: '14px',
              })}
            >
              <dt class={flex({ align: 'center', gap: '2px', width: '120px' })}>
                즉시출금 수수료
                <Tooltip message="즉시출금 신청 시 1건당 500원의 추가 수수료가 발생해요">
                  <Icon
                    style={css.raw({ size: '16px', color: 'gray.500', transform: 'rotate(180deg)' })}
                    icon={IconInfoCircle}
                  />
                </Tooltip>
              </dt>
              <dd class={css({ fontWeight: 'semibold' })}>500원</dd>
            </div>
          {/if}
          <div
            class={flex({
              align: 'center',
              gap: '16px',
              borderBottomWidth: '1px',
              borderColor: 'gray.100',
              paddingX: '10px',
              paddingY: '14px',
            })}
          >
            <dt class={flex({ align: 'center', gap: '2px', width: '120px' })}>
              소득세
              <Tooltip
                style={flex.raw({ align: 'center' })}
                message="소득에 대한 세금을 직접 납부하는 불편함을 줄여드리기 위해 회사가 원천징수를 통해 대리해 납부해 드리는 금액이에요"
              >
                <Icon
                  style={css.raw({ size: '16px', color: 'gray.500', transform: 'rotate(180deg)' })}
                  icon={IconInfoCircle}
                />
              </Tooltip>
            </dt>
            <dd class={css({ fontWeight: 'semibold' })}>{comma($revenueWithdrawal.taxAmount)}원</dd>
          </div>
        </dl>
      </div>

      <p class={css({ paddingY: '10px', fontSize: '12px', color: 'gray.500' })}>
        원천징수란 소득자가 자신의 세금을 직접 납부하는 게 아닌, 원천징수 대상 소득을 지급하는 원천징수 의무자(회사)가
        소득자로부터 세금을 미리 징수하여 국가에 납부하는 제도를 말해요. 원천징수된 세금은 다음 해 5월 종합소득세 신고를
        통해 돌려받을 수 있어요.
      </p>

      <div class={css({ marginTop: '24px' })}>
        <p
          class={css({
            borderBottomWidth: '1px',
            borderColor: 'gray.300',
            paddingX: '10px',
            paddingY: '8px',
            fontSize: '18px',
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
              paddingX: '10px',
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
