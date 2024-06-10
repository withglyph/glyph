<script lang="ts">
  import IconHelpLine from '~icons/glyph/help-line';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Icon, Modal, Tooltip } from '$lib/components';
  import { banks } from '$lib/const/revenue';
  import { comma } from '$lib/utils';
  import { calculateFeeAmount } from '$lib/utils/revenue';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { MeRevenuePage_InstantSettleRevenueModal_user } from '$glitch';

  export let open = false;

  let _user: MeRevenuePage_InstantSettleRevenueModal_user;
  export { _user as $user };

  $: user = fragment(
    _user,
    graphql(`
      fragment MeRevenuePage_InstantSettleRevenueModal_user on User {
        id
        withdrawableRevenue: revenue(withdrawable: true)

        settlementIdentity {
          id
          bankAccountHolderName
          bankCode
          bankAccountNumber
        }
      }
    `),
  );

  const instantSettleRevenue = graphql(`
    mutation InstantSettleRevenue_Mutation {
      instantSettleRevenue {
        id
        revenue(withdrawable: true)

        revenueWithdrawals {
          id
        }
      }
    }
  `);

  $: feeAmount = calculateFeeAmount($user.withdrawableRevenue, 1000);
</script>

<Modal bind:open>
  <svelte:fragment slot="title">즉시출금</svelte:fragment>

  <p class={css({ fontSize: '15px' })}>
    출금 요청하신 금액은
    <br />
    <mark class={css({ fontSize: '20px', fontWeight: 'bold', color: 'brand.400' })}>
      {comma($user.withdrawableRevenue)}원
    </mark>
    입니다
  </p>

  <div
    class={flex({
      align: 'center',
      gap: '2px',
      marginTop: '10px',
      borderWidth: '1px',
      borderColor: 'gray.100',
      paddingX: '10px',
      paddingY: '12px',
      fontSize: '13px',
      color: 'gray.500',
    })}
  >
    지급 계좌:
    {banks[$user.settlementIdentity?.bankCode ?? '']}
    {$user.settlementIdentity?.bankAccountNumber}
    ({$user.settlementIdentity?.bankAccountHolderName})
  </div>

  <dl class={css({ marginTop: '20px', fontSize: '14px' })}>
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
      <dt class={css({ width: '108px' })}>출금 신청 금액</dt>
      <dd class={css({ fontWeight: 'semibold' })}>{comma($user.withdrawableRevenue)}원</dd>
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
      <dt class={flex({ align: 'center', gap: '2px', width: '108px' })}>
        출금 수수료
        <Tooltip message="출금에 필요한 금융망 이용료" offset={10} placement="top">
          <Icon style={css.raw({ 'color': 'gray.400', '& *': { strokeWidth: '[1]' } })} icon={IconHelpLine} />
        </Tooltip>
      </dt>
      <dd class={css({ fontWeight: 'semibold' })}>1,000원</dd>
    </div>
    <div
      class={flex({
        align: 'center',
        gap: '16px',
        paddingX: '12px',
        paddingY: '14px',
        backgroundColor: 'gray.50',
      })}
    >
      <dt class={css({ width: '108px' })}>최종 지급 금액</dt>
      <dd class={css({ fontWeight: 'semibold' })}>{comma(feeAmount.settleAmount)}원</dd>
    </div>
  </dl>

  <p class={css({ paddingTop: '8px', fontSize: '12px', color: 'gray.500' })}>
    즉시출금은 1,000원 이상 가능하며, 출금 금액과 상관없이 고정적으로 1,000원의 수수료가 부과됩니다.
  </p>

  <Button
    slot="action"
    style={css.raw({ width: 'full' })}
    variant="gradation-fill"
    on:click={async () => {
      await instantSettleRevenue();
      mixpanel.track('user:instant-settle-revenue');
      open = false;
    }}
  >
    신청
  </Button>
</Modal>
