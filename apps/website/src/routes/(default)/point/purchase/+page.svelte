<script lang="ts">
  import qs from 'query-string';
  import IconChevronLeft from '~icons/tabler/chevron-left';
  import Paypal from '$assets/icons/paypal.svg?component';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Helmet, Icon, Link, ToggleButton } from '$lib/components';
  import { Checkbox } from '$lib/components/forms';
  import { Button, Modal } from '$lib/components/v2';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { comma } from '$lib/utils';
  import { PurchasePointSchema } from '$lib/validations';
  import { css } from '$styled-system/css';
  import { flex, grid } from '$styled-system/patterns';
  import type { PaymentMethod } from '$glitch';

  $: query = graphql(`
    query PointPurchasePage_Query {
      auth(scope: USER)

      me @_required {
        id
        point
      }
    }
  `);

  const { form, data } = createMutationForm({
    mutation: graphql(`
      mutation PointPurchasePage_PurchasePoint_Mutation($input: PurchasePointInput!) {
        purchasePoint(input: $input) {
          id
          paymentData
        }
      }
    `),
    schema: PurchasePointSchema,
    onSuccess: (resp) => {
      mixpanel.track('point:purchase:start', {
        paymentMethod: $data.paymentMethod,
        pointAmount: $data.pointAmount,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const callback = async (resp: any) => {
        if (resp.error_msg) {
          toast(resp.error_msg);
          return;
        }

        location.href = qs.stringifyUrl({
          url: '/api/payment/callback',
          query: { imp_uid: resp.imp_uid },
        });
      };

      // @ts-expect-error portone 관련 코드
      IMP.init('imp72534540');

      if (resp.paymentData.pg === 'paypal_v2') {
        paypalOpen = true;
        // @ts-expect-error portone 관련 코드
        IMP.loadUI('paypal-spb', resp.paymentData, callback);
      } else {
        // @ts-expect-error portone 관련 코드
        IMP.request_pay(resp.paymentData, callback);
      }
    },
  });

  let paypalOpen = false;

  const pointAmounts = [1000, 3000, 5000, 10_000, 30_000, 50_000, 100_000];
  const paymentMethods: [PaymentMethod, string][] = [
    ['CREDIT_CARD', '신용카드'],
    ['BANK_ACCOUNT', '계좌이체'],
    ['VIRTUAL_BANK_ACCOUNT', '가상계좌'],
    ['PHONE_BILL', '휴대폰결제'],
    ['GIFTCARD_CULTURELAND', '문화상품권'],
    ['GIFTCARD_SMARTCULTURE', '스마트문화상품권'],
    ['GIFTCARD_BOOKNLIFE', '도서문화상품권'],
    ['PAYPAL', '페이팔'],
  ];
</script>

<svelte:head>
  <script src="https://cdn.iamport.kr/v1/iamport.js">
  </script>
</svelte:head>

<Helmet description="글리프 포인트를 충전할 수 있어요" title="포인트 충전" />

<div
  class={css({ marginTop: { sm: '40px' }, marginX: 'auto', paddingBottom: '120px', width: 'full', maxWidth: '860px' })}
>
  <h1
    class={flex({
      align: 'center',
      gap: '4px',
      width: 'full',
      fontSize: { base: '17px', sm: '24px' },
      fontWeight: { base: 'semibold', sm: 'bold' },
      smDown: {
        position: 'sticky',
        top: '62px',
        borderBottomWidth: '1px',
        borderBottomColor: 'gray.150',
        paddingY: '13px',
        paddingX: '20px',
        backgroundColor: 'gray.5',
        zIndex: '50',
      },
    })}
  >
    <a href="/me/point">
      <Icon style={css.raw({ hideFrom: 'sm' })} icon={IconChevronLeft} size={24} />
      <Icon style={css.raw({ hideBelow: 'sm' })} icon={IconChevronLeft} size={28} />
    </a>
    포인트 충전
  </h1>

  <form
    class={flex({
      direction: 'column',
      align: 'center',
      gap: { base: '28px', sm: '48px' },
      smDown: { paddingX: '20px' },
    })}
    use:form
  >
    <div
      class={flex({
        align: 'center',
        gap: '10px',
        borderBottomWidth: '1px',
        borderBottomColor: 'gray.50',
        paddingTop: { base: '20px', sm: '32px' },
        paddingBottom: { base: '12px', sm: '16px' },
        width: 'full',
      })}
    >
      <div class={flex({ align: 'center', gap: '10px', marginX: 'auto', width: 'full', maxWidth: '540px' })}>
        <h2 class={css({ fontSize: { sm: '18px' }, fontWeight: 'semibold' })}>보유중인 포인트</h2>
        <span class={css({ fontSize: { base: '20px', sm: '24px' }, fontWeight: 'bold', color: 'brand.400' })}>
          {comma($query.me.point)}P
        </span>
      </div>
    </div>

    <div class={css({ width: 'full', maxWidth: '540px' })}>
      <h2 class={css({ fontSize: { sm: '18px' }, fontWeight: 'semibold' })}>충전 포인트</h2>

      <ul
        class={grid({
          columns: { base: 3, sm: 4 },
          gap: { base: '10px', sm: '12px' },
          marginTop: '16px',
          marginBottom: { base: '16px', sm: '12px' },
        })}
      >
        {#each pointAmounts as amount (amount)}
          <li>
            <ToggleButton
              style={css.raw({
                paddingY: { base: '12px', sm: '14px' },
                fontWeight: 'semibold',
                backgroundColor: 'gray.5',
                color: 'gray.900',
                width: 'full',
              })}
              checked={$data.pointAmount === amount}
              type="radio"
              value={$data.pointAmount}
              on:change={() => ($data.pointAmount = amount)}
            >
              {comma(amount)}P
            </ToggleButton>
          </li>
        {/each}
      </ul>

      <div
        class={flex({
          align: 'center',
          gap: '8px',
          paddingY: '14px',
          paddingX: '16px',
          fontSize: '14px',
          backgroundColor: 'gray.50',
        })}
      >
        <span class={css({ fontWeight: 'medium', color: 'gray.600' })}>충전 후 보유 포인트</span>
        <span class={css({ fontWeight: 'semibold' })}>
          {comma($query.me.point + ($data.pointAmount ?? 0))}P
        </span>
      </div>
    </div>

    <hr class={css({ border: 'none', width: 'full', height: '1px', backgroundColor: 'gray.50' })} />

    <div class={css({ width: 'full', maxWidth: '540px' })}>
      <h2 class={css({ fontSize: { sm: '18px' }, fontWeight: 'semibold' })}>결제수단</h2>

      <ul
        class={grid({
          columns: { base: 3, sm: 4 },
          gap: { base: '10px', sm: '12px' },
          marginTop: '16px',
          marginBottom: { base: '16px', sm: '12px' },
          width: 'full',
          maxWidth: '540px',
        })}
      >
        {#each paymentMethods as [method, name] (method)}
          <li>
            <ToggleButton
              style={css.raw({
                paddingY: { base: '12px', sm: '14px' },
                fontWeight: 'semibold',
                backgroundColor: 'gray.5',
                color: 'gray.900',
                width: 'full',
              })}
              checked={$data.paymentMethod === method}
              type="radio"
              value={$data.pointAmount}
              on:change={() => ($data.paymentMethod = method)}
            >
              {#if method === 'PAYPAL'}
                <Paypal class={css({ height: '20px' })} />
              {:else}
                {name}
              {/if}
            </ToggleButton>
          </li>
        {/each}
      </ul>
    </div>

    <hr class={css({ border: 'none', width: 'full', height: '1px', backgroundColor: 'gray.50' })} />

    <div class={css({ width: 'full', maxWidth: '540px' })}>
      <p class={flex({ align: 'center', gap: '10px', marginBottom: '16px' })}>
        <span class={css({ fontSize: { sm: '18px' }, fontWeight: 'semibold' })}>최종 결제 금액</span>
        <mark class={css({ fontSize: { base: '20px', sm: '24px' }, fontWeight: 'bold', color: 'brand.400' })}>
          {Number.isNaN(Math.floor($data.pointAmount * 1.1)) ? '0' : comma(Math.floor($data.pointAmount * 1.1))}원
        </mark>
      </p>

      <Checkbox name="pointAgreement" size="sm">
        주문 내용 및 아래 유의 사항을 확인하였으며, 충전에 동의합니다.
      </Checkbox>

      <Button style={css.raw({ marginTop: '12px', width: 'full' })} size="lg" type="submit" variant="gradation-fill">
        포인트 충전하기
      </Button>
    </div>

    <div class={css({ borderTopWidth: '1px', borderTopColor: 'gray.50', paddingTop: '24px' })}>
      <p class={css({ fontSize: '14px', fontWeight: 'semibold', color: 'gray.600' })}>결제 전 확인해주세요!</p>

      <div class={css({ marginTop: '16px', fontSize: '13px', color: 'gray.500' })}>
        - 모든 금액은 부가가치세 제외 금액입니다. 결제 진행시 부가가치세 10%가 부과되어 결제됩니다.
        <br />

        - 충전한 포인트 전액 결제 취소는 포인트를 구매한 뒤 사용한 이력이 없고 결제 후 7일 이내에 결제 취소한 경우에
        가능합니다.
        <br />

        - 포인트는 결제한 날로부터 5년이 되는 시점에 소멸됩니다. 단, 직접 회원 탈퇴해서 계정이 삭제되면 그 즉시 소멸되어
        복구할 수 없습니다.
        <br />

        - 잔여 포인트는 충전한 포인트의 잔액이 80% 이하일 때에 한해 환불 신청이 가능하며, 잔액의 10% 또는 1,000원 중 큰
        금액을 환급 수수료로 제외하고 환불해드립니다. 포인트 잔액이 1,000원 이하이면 환불이 불가능합니다. 환불은
        <!-- prettier-ignore -->
        <Link style={css.raw({ textDecorationLine: 'underline' })} href="https://help.withglyph.com/">
        글리프 도움 센터</Link>를 통해 신청할 수 있습니다.
        <br />
        - 무료로 지급받은 포인트는 환불받을 수 없으며, 지급일로부터 1년이 되는 시점에 소멸됩니다.
        <br />

        - 환불 페이지의 모든 양식을 기입하여 제출하면 즉시 잔여 포인트가 차감됩니다. 환불한 금액은 영업일 기준으로 5일
        안에 환불 계좌로 입금해 드립니다.
        <br />

        - 미성년자는 포인트를 충전하기 전에 부모 등 법정 대리인의 동의를 받아야 합니다. 법정대리인이 동의하지 않으면
        미성년자 본인 또는 법정대리인이 이용 계약을 취소할 수 있습니다.
        <br />

        - 자세한 내용은 서비스 이용 전 동의하신
        <!-- prettier-ignore -->
        <Link
        style={css.raw({ textDecorationLine: 'underline' })}
        href="https://help.withglyph.com/legal/terms"
      >
        이용약관</Link>을 참조해주시기 바랍니다.
      </div>
    </div>
  </form>
</div>

<Modal bind:open={paypalOpen}>
  <div class="portone-ui-container" data-portone-ui-type="paypal-spb"></div>
</Modal>
