<script lang="ts">
  import dayjs from 'dayjs';
  import IconHelpLine from '~icons/glyph/help-line';
  import IconChevronRight from '~icons/tabler/chevron-right';
  import { graphql } from '$glitch';
  import { Icon, Tooltip } from '$lib/components';
  import { TabHead, TabHeadItem } from '$lib/components/tab';
  import { Button } from '$lib/components/v2';
  import { banks } from '$lib/const/revenue';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import InstantSettleRevenueModal from './InstantSettleRevenueModal.svelte';
  import VerifySettlementIdentityModal from './VerifySettlementIdentityModal.svelte';

  let instantSettleRevenueOpen = false;
  let open = false;

  $: query = graphql(`
    query MeRevenueLayout_Query {
      auth(scope: USER)

      me @_required {
        id
        revenue
        withdrawableRevenue: revenue(withdrawable: true)

        withdrawalConfig {
          id
          monthlyWithdrawalDue
          monthlyWithdrawalEnabled
        }

        personalIdentity {
          id
        }

        settlementIdentity {
          id
          bankCode
          bankAccountNumber
        }

        ...MeRevenuePage_InstantSettleRevenueModal_user
        ...MeRevenuePage_VerifySettlementIdentityModal_user
      }
    }
  `);
</script>

<h1 class={css({ marginBottom: '12px', fontSize: '24px', fontWeight: 'bold', hideBelow: 'sm' })}>수익/출금</h1>

<div class={css({ smDown: { paddingTop: '20px', backgroundColor: 'gray.50' } })}>
  {#if $query.me.settlementIdentity}
    <p
      class={flex({
        align: 'center',
        gap: '4px',
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: 'medium',
        smDown: { paddingX: '20px' },
      })}
    >
      내 계좌: {banks[$query.me.settlementIdentity.bankCode]}
      {$query.me.settlementIdentity.bankAccountNumber}
      <Tooltip
        style={flex.raw({ align: 'center' })}
        message="출금 계좌 변경은 사이트 하단 고객센터를 통해 가능해요"
        offset={12}
        placement="top"
      >
        <Icon style={css.raw({ 'color': 'gray.400', '& *': { strokeWidth: '[1]' } })} icon={IconHelpLine} />
      </Tooltip>
    </p>
  {/if}

  <div
    class={flex({
      flexDirection: 'column',
      justify: 'space-between',
      backgroundColor: 'gray.50',
      width: { base: 'full', sm: 'fit' },
      padding: '20px',
      smDown: { paddingTop: '0' },
    })}
  >
    <div class={flex({ align: 'center', justify: { base: 'space-between', sm: 'flex-start' }, gap: '70px' })}>
      <div>
        <div class={flex({ align: 'center', gap: '4px', fontWeight: 'medium' })}>
          출금 가능 금액
          <Tooltip
            style={flex.raw({ align: 'center' })}
            message="창작자의 권리보호를 위해 수익 발생 7일 이후 출금할 수 있어요"
          >
            <Icon style={css.raw({ 'color': 'gray.400', '& *': { strokeWidth: '[1]' } })} icon={IconHelpLine} />
          </Tooltip>
        </div>
        <p class={css({ fontSize: { base: '20px', sm: '22px' }, fontWeight: 'bold' })}>
          {comma($query.me.withdrawableRevenue)}원
        </p>
      </div>

      <Tooltip enabled={$query.me.withdrawableRevenue < 1000} message="즉시출금은 1,000원 이상부터 신청 가능해요">
        <Button
          style={css.raw({ width: '90px' })}
          disabled={$query.me.withdrawableRevenue < 1000}
          size="sm"
          variant="gradation-fill"
          on:click={() => {
            if (!$query.me.settlementIdentity) {
              open = true;
              return;
            }

            instantSettleRevenueOpen = true;
          }}
        >
          즉시출금
        </Button>
      </Tooltip>
    </div>

    <hr class={css({ border: 'none', marginY: '14px', height: '1px', backgroundColor: 'gray.150' })} />

    <time
      class={css({ marginBottom: '4px', fontSize: '12px', color: 'gray.600' })}
      datetime={dayjs().kst().formatAsDate()}
    >
      -{dayjs().kst().formatAsDate()}
    </time>

    <p class={css({ fontSize: '14px', fontWeight: 'medium' })}>포스트 수익 {comma($query.me.revenue)}P</p>
  </div>
</div>

{#if !$query.me.personalIdentity || !$query.me.settlementIdentity}
  <div
    class={css({
      borderYWidth: '1px',
      borderColor: 'gray.150',
      padding: '20px',
      backgroundColor: 'gray.5',
      sm: {
        borderXWidth: '1px',
        marginTop: '12px',
      },
    })}
  >
    <p class={css({ fontSize: '15px', fontWeight: 'semibold' })}>출금 전 계좌 인증이 필요해요</p>

    <p class={css({ marginTop: '2px', marginBottom: '10px', fontSize: '13px', color: 'gray.600' })}>
      수익금을 출금하기 전 계좌 인증이 필요해요. 본인 명의의 국내 은행 계좌와 신분증을 미리 준비해 주세요.
    </p>

    <button
      class={css({
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        color: 'brand.400',
        width: 'fit',
        fontSize: '14px',
        fontWeight: 'medium',
      })}
      type="button"
      on:click={() => (open = true)}
    >
      계좌인증 <Icon icon={IconChevronRight} />
    </button>
  </div>
{/if}

<div
  class={css({
    marginTop: '8px',
    paddingX: { smDown: '20px' },
    fontSize: '12px',
    color: 'gray.500',
  })}
>
  즉시출금 시 출금금액과 상관없이 고정적으로 1,000원의 수수료가 부과됩니다.
</div>

<h2
  class={css({
    marginTop: '60px',
    paddingX: { smDown: '20px' },
    fontSize: { base: '18px', sm: '24px' },
    fontWeight: 'bold',
  })}
>
  이용내역
</h2>

<TabHead
  style={css.raw({ paddingTop: '12px', paddingBottom: { base: '12px', sm: '0' }, paddingX: { smDown: '20px' } })}
>
  <TabHeadItem id={1} pathname="/me/revenue">수익</TabHeadItem>
  <TabHeadItem id={2} pathname="/me/revenue/settlement">출금</TabHeadItem>
</TabHead>

<div class={css({ paddingX: { smDown: '20px' } })}>
  <slot />
</div>

<InstantSettleRevenueModal $user={$query.me} bind:open={instantSettleRevenueOpen} />
<VerifySettlementIdentityModal $user={$query.me} bind:open />
