<script lang="ts">
  import IconInfoCircle from '~icons/tabler/alert-circle';
  import IconChevronRight from '~icons/tabler/chevron-right';
  import { graphql } from '$glitch';
  import { Icon, Tooltip } from '$lib/components';
  import { TabHead, TabHeadItem } from '$lib/components/tab';
  import { Button } from '$lib/components/v2';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import InstantSettleRevenueModal from './InstantSettleRevenueModal.svelte';
  import MonthlyWithdrawSettingModal from './MonthlyWithdrawSettingModal.svelte';
  import VerifySettlementIdentityModal from './VerifySettlementIdentityModal.svelte';

  let instantSettleRevenueOpen = false;
  let monthlyWithdrawSettingOpen = false;
  let open = false;

  $: query = graphql(`
    query MeRevenueLayout_Query {
      auth(scope: USER)

      me @_required {
        id
        revenue

        personalIdentity {
          id
        }

        ...MeRevenuePage_VerifySettlementIdentityModal_user
      }
    }
  `);

  let verified = true; // 창작자 인증 여부
  let on = true; // 자동출금 on 여부
</script>

<h1
  class={css({
    paddingBottom: '8px',
    fontSize: '24px',
    fontWeight: 'bold',
    smDown: { paddingTop: '24px', paddingX: '20px' },
  })}
>
  수익/출금
</h1>

{#if verified}
  <p class={flex({ align: 'center', gap: '2px', smDown: { paddingX: '20px' } })}>
    내 계좌: <span>카카오뱅크 3333-02-000000</span>
    <!-- 계좌 변경 시 cs 문의 -->
    <Tooltip style={flex.raw({ align: 'center' })} message="">
      <Icon style={css.raw({ size: '16px', color: 'gray.500', transform: 'rotate(180deg)' })} icon={IconInfoCircle} />
    </Tooltip>
  </p>
{/if}

<div class={flex({ gap: '12px', marginTop: '20px', smDown: { paddingX: '20px' } })}>
  <div
    class={flex({
      flexDirection: 'column',
      justify: 'space-between',
      borderWidth: '1px',
      borderColor: 'gray.150',
      borderRadius: '8px',
      backgroundColor: 'white',
      width: 'full',
      maxWidth: '278px',
      padding: { base: '20px', sm: '24px' },
    })}
  >
    <div>
      <div class={flex({ align: 'center', gap: '4px', fontSize: { base: '14px', sm: '16px' }, fontWeight: 'medium' })}>
        출금 가능 금액
        <Tooltip style={flex.raw({ align: 'center' })} message="">
          <Icon
            style={css.raw({ size: '16px', color: 'gray.500', transform: 'rotate(180deg)' })}
            icon={IconInfoCircle}
          />
        </Tooltip>
      </div>
      <p class={css({ fontSize: { base: '24px', sm: '26px' }, fontWeight: 'semibold' })}>100원</p>
    </div>

    <Button style={css.raw({ hideFrom: 'sm' })} size="md" on:click={() => (instantSettleRevenueOpen = true)}>
      즉시 출금
    </Button>
    <Button style={css.raw({ hideBelow: 'sm' })} size="lg" on:click={() => (instantSettleRevenueOpen = true)}>
      즉시 출금
    </Button>
  </div>
  <div class={flex({ flexDirection: 'column', gap: '8px', width: { base: 'full', sm: 'fit' } })}>
    <div
      class={css({
        borderWidth: '1px',
        borderColor: 'gray.150',
        borderRadius: '8px',
        padding: { base: '20px', sm: '24px' },
        backgroundColor: 'white',
      })}
    >
      <div
        class={flex({
          sm: { gap: '4px' },
          flexWrap: 'wrap',
          align: { base: 'start', sm: 'center' },
          marginBottom: '2px',
          smDown: { flexDirection: 'column' },
        })}
      >
        <p class={css({ fontSize: { base: '14px', sm: '16px' }, fontWeight: 'medium' })}>포스트 수익</p>
        <time class={css({ fontSize: '11px', color: 'gray.400' })}>(23.05.10-23.05.20)</time>
      </div>
      <p class={css({ fontSize: { base: '16px', sm: '18px' }, fontWeight: { base: 'medium', sm: 'semibold' } })}>
        {comma(100)}P
      </p>
    </div>
    <div
      class={flex({
        flexDirection: 'column',
        gap: '4px',
        borderWidth: '1px',
        borderColor: 'gray.150',
        borderRadius: '8px',
        padding: { base: '20px', sm: '24px' },
        backgroundColor: 'white',
      })}
    >
      <div class={flex({ align: 'center', gap: '4px' })}>
        <p class={css({ fontSize: { base: '14px', sm: '16px' }, fontWeight: 'medium' })}>자동 출금</p>
        <Tooltip style={flex.raw({ align: 'center' })} message="">
          <Icon
            style={css.raw({ size: '16px', color: 'gray.500', transform: 'rotate(180deg)' })}
            icon={IconInfoCircle}
          />
        </Tooltip>
      </div>

      <p
        class={css(
          on ? { color: 'teal.500' } : { color: 'gray.400' },
          !verified && { fontSize: '14px', fontWeight: 'medium' },
        )}
      >
        {#if verified}
          <button
            class={css({ display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 'semibold', width: 'full' })}
            type="button"
            on:click={() => (monthlyWithdrawSettingOpen = true)}
          >
            {on ? 'ON' : 'OFF'}
            <Icon style={css.raw({ size: '20px' })} icon={IconChevronRight} />
          </button>
        {:else}
          창작자 인증이 필요해요
        {/if}
      </p>
    </div>
  </div>
</div>

{#if !$query.me.personalIdentity || !verified}
  <div
    class={css({
      paddingX: { base: '20px', sm: '24px' },
      paddingY: '20px',
      marginTop: '12px',
      backgroundColor: 'white',
      sm: {
        borderWidth: '1px',
        borderColor: 'gray.150',
        borderRadius: '8px',
      },
    })}
  >
    <p class={css({ fontWeight: 'semibold' })}>출금 시 본인인증 후 창작자 인증이 필요해요</p>

    <p class={css({ marginTop: '4px', marginBottom: '16px', fontSize: '14px', color: 'gray.500' })}>
      창작자님의 수익에 대한 원천징수 신고를 하기 위해 꼭 필요한 정보예요. 창작자님이 신고해야 할 세액을 회사에서
      세무적으로 대신 신고하는것이기 때문에, 세무서에 제출해야 하는 정보입니다.
    </p>

    <div class={flex({ align: 'center', gap: '14px' })}>
      {#if !$query.me.personalIdentity}
        <a
          class={flex({
            align: 'center',
            gap: '2px',
            color: 'teal.500',
            width: 'fit',
            fontSize: '14px',
            fontWeight: 'medium',
          })}
          href="/me/settings"
        >
          본인인증 <Icon icon={IconChevronRight} />
        </a>
      {/if}

      <button
        class={css({
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          color: { base: 'teal.500', _disabled: 'gray.400' },
          width: 'fit',
          fontSize: '14px',
          fontWeight: 'medium',
        })}
        disabled={!$query.me.personalIdentity}
        type="button"
        on:click={() => (open = true)}
      >
        창작자인증 <Icon
          style={css.raw(!$query.me.personalIdentity && { transform: 'rotate(180deg)' })}
          icon={$query.me.personalIdentity ? IconChevronRight : IconInfoCircle}
        />
      </button>
    </div>
  </div>
{/if}

<div
  class={css({
    marginTop: '10px',
    paddingX: { smDown: '20px' },
    fontSize: '13px',
    color: '[#9B9B9E]',
  })}
>
  - 즉시출금 금액은 1회 최소 1,000원 이상으로 신청 가능합니다. (정산 수수료 500원 발생) <br />
  - 정기출금 정산일은 매월 10일이며, 30,000원 이상의 수익금이 발생했을 때 자동으로 출금됩니다. 정기출금을 원치 않다면 정기출금
  off모드로 변경해주세요.
</div>

<div
  class={flex({
    direction: 'column',
    gap: '12px',
    marginTop: '40px',
    paddingTop: '20px',
    paddingBottom: '32px',
    backgroundColor: 'white',
    sm: {
      borderWidth: '1px',
      borderColor: 'gray.200',
      borderRadius: '16px',
    },
  })}
>
  <TabHead style={css.raw({ marginX: '20px' })} variant="secondary">
    <TabHeadItem id={1} style={css.raw({ fontSize: '16px' })} pathname="/me/revenue">내 수익</TabHeadItem>
    <TabHeadItem id={2} style={css.raw({ fontSize: '16px' })} pathname="/me/revenue/settlement">출금 내역</TabHeadItem>
  </TabHead>

  <div class={css({ paddingX: { base: '20px', sm: '24px' } })}>
    <slot />
  </div>
</div>

<InstantSettleRevenueModal bind:open={instantSettleRevenueOpen} />
<MonthlyWithdrawSettingModal bind:open={monthlyWithdrawSettingOpen} />
<VerifySettlementIdentityModal $user={$query.me} bind:open />
