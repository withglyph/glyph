<script lang="ts">
  import dayjs from 'dayjs';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Switch } from '$lib/components/forms';
  import { Modal } from '$lib/components/v2';
  import { banks } from '$lib/const/revenue';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { MeRevenuePage_MonthlyWithdrawSettingModal_user } from '$glitch';

  export let open = false;

  let _user: MeRevenuePage_MonthlyWithdrawSettingModal_user;
  export { _user as $user };

  $: user = fragment(
    _user,
    graphql(`
      fragment MeRevenuePage_MonthlyWithdrawSettingModal_user on User {
        id

        withdrawalConfig {
          id
          monthlyWithdrawalDue
          monthlyWithdrawalEnabled
        }

        settlementIdentity {
          id
          bankCode
          bankAccountNumber
          bankAccountHolderName
        }
      }
    `),
  );

  const disableMonthlyWithdrawal = graphql(`
    mutation MeRevenuePage_MonthlyWithdrawSettingModal_DisableMonthlyWithdrawal_Mutation {
      disableMonthlyWithdrawal {
        id
        monthlyWithdrawalDue
        monthlyWithdrawalEnabled
      }
    }
  `);

  const enableMonthlyWithdrawal = graphql(`
    mutation MeRevenuePage_MonthlyWithdrawSettingModal_EnableMonthlyWithdrawal_Mutation {
      enableMonthlyWithdrawal {
        id
        monthlyWithdrawalDue
        monthlyWithdrawalEnabled
      }
    }
  `);
</script>

<Modal titleStyle={css.raw({ justifyContent: 'center', marginX: '32px' })} bind:open>
  <svelte:fragment slot="title">자동 출금 설정</svelte:fragment>

  <div class={css({ paddingTop: '16px', paddingX: '20px' })}>
    <div class={flex({ align: 'center', justify: 'space-between' })}>
      <div class={flex({ flexDirection: 'column', gap: '2px' })}>
        <p class={css({ fontWeight: 'semibold' })}>자동출금</p>
        <span class={css({ fontSize: '10px', color: 'gray.400' })}>
          ({dayjs($user.withdrawalConfig?.monthlyWithdrawalDue).formatAsDate()} 출금예정)
        </span>
      </div>
      <Switch
        value={$user.withdrawalConfig?.monthlyWithdrawalEnabled}
        on:change={async () => {
          if ($user.withdrawalConfig?.monthlyWithdrawalEnabled) {
            await disableMonthlyWithdrawal();
            mixpanel.track('user:disable-monthly-withdrawal');
          } else {
            await enableMonthlyWithdrawal();
            mixpanel.track('user:enable-monthly-withdrawal');
          }
        }}
      />
    </div>

    <div
      class={flex({
        align: 'center',
        gap: '2px',
        marginTop: '12px',
        marginBottom: '20px',
        paddingX: '10px',
        paddingY: '8px',
        borderRadius: '6px',
        fontSize: '13px',
        color: 'gray.500',
        backgroundColor: 'gray.50',
      })}
    >
      <span>{banks[$user.settlementIdentity?.bankCode ?? '']} {$user.settlementIdentity?.bankAccountNumber}</span>
      <span>({$user.settlementIdentity?.bankAccountHolderName})</span>
    </div>
  </div>

  <div class={css({ padding: '20px', paddingBottom: '60px', backgroundColor: 'gray.50' })}>
    <p class={css({ marginBottom: '8px', fontSize: '14px', fontWeight: 'semibold', color: 'gray.500' })}>유의사항</p>

    <p class={css({ fontSize: '13px', color: 'gray.500' })}>
      - 즉시출금 금액은 1회 최소 1,000원 이상으로 신청 가능합니다. (정산 수수료 500원 발생)
      <br />
      - 정기출금 정산일은 매월 10일이며, 30,000원 이상의 수익금이 발생했을 때 자동으로 출금됩니다. 정기출금을 원치 않다면
      정기출금 off모드로 변경해주세요.
    </p>
  </div>
</Modal>
