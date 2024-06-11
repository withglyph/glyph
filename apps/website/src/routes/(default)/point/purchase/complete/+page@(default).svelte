<script lang="ts">
  import dayjs from 'dayjs';
  import { onMount } from 'svelte';
  import { graphql } from '$glitch';
  import { Button, Helmet } from '$lib/components';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import type { PaymentMethod } from '$glitch';

  $: query = graphql(`
    query PointPurchaseCompletePage_Query($paymentKey: String!) {
      me @_required {
        id
        point
      }

      pointPurchase(paymentKey: $paymentKey) {
        id
        state
        pointAmount
        paymentMethod
        paymentAmount
        paymentResult
        expiresAt
      }
    }
  `);

  let timer: NodeJS.Timeout | null = null;

  const paymentMethods: Record<PaymentMethod, string> = {
    CREDIT_CARD: '신용카드',
    BANK_ACCOUNT: '계좌이체',
    VIRTUAL_BANK_ACCOUNT: '무통장 입금',
    PHONE_BILL: '휴대폰결제',
    GIFTCARD_CULTURELAND: '문화상품권',
    GIFTCARD_SMARTCULTURE: '스마트문화상품권',
    GIFTCARD_BOOKNLIFE: '도서문화상품권',
    PAYPAL: '페이팔',
    IN_APP_PURCHASE: '앱 내 구매',
  };

  onMount(() => {
    if ($query.pointPurchase.state === 'PENDING') {
      timer = setInterval(() => {
        query.refetch();
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  });

  $: if ($query.pointPurchase.state === 'COMPLETED' && timer) {
    clearInterval(timer);
  }
</script>

<Helmet description="글리프 포인트를 충전할 수 있어요" title="포인트 충전" />

<div
  class={center({
    flexDirection: 'column',
    marginTop: '80px',
    marginBottom: '120px',
    width: 'full',
    smDown: { paddingX: '20px' },
  })}
>
  {#if $query.pointPurchase.state === 'PENDING' && $query.pointPurchase.paymentMethod === 'VIRTUAL_BANK_ACCOUNT'}
    <div class={css({ width: 'full', maxWidth: '386px' })}>
      <h1
        class={css({
          marginBottom: '4px',
          textAlign: 'center',
          fontSize: { base: '20px', sm: '24px' },
          fontWeight: 'bold',
        })}
      >
        가상계좌가 생성되었어요
      </h1>
      <p class={css({ fontSize: { base: '14px', sm: '16px' }, textAlign: 'center', color: 'gray.600' })}>
        입금이 완료되면 결제 완료 페이지로 이동해요
      </p>

      <dl
        class={css({
          marginTop: '20px',
          marginBottom: '16px',
          borderWidth: '1px',
          borderColor: 'gray.200',
        })}
      >
        <div class={flex({ align: 'center', fontSize: '14px' })}>
          <dt class={css({ padding: '14px', width: '120px' })}>가상계좌 은행</dt>
          <dd class={css({ padding: '14px', fontWeight: 'semibold' })}>
            {$query.pointPurchase.paymentResult.vbank_name}
          </dd>
        </div>

        <div class={flex({ align: 'center', borderTopWidth: '1px', borderTopColor: 'gray.200', fontSize: '14px' })}>
          <dt class={css({ padding: '14px', width: '120px' })}>가상계좌번호</dt>
          <dd class={flex({ align: 'center', gap: '10px', wrap: 'wrap', padding: '14px', fontWeight: 'semibold' })}>
            {$query.pointPurchase.paymentResult.vbank_num}
            <Button
              size="xs"
              variant="brand-fill"
              on:click={() => {
                navigator.clipboard.writeText($query.pointPurchase.paymentResult.vbank_num);
              }}
            >
              계좌번호 복사
            </Button>
          </dd>
        </div>
        <div class={flex({ align: 'center', borderTopWidth: '1px', borderTopColor: 'gray.200', fontSize: '14px' })}>
          <dt class={css({ padding: '14px', width: '120px' })}>결제금액</dt>
          <dd class={css({ padding: '14px', fontWeight: 'semibold' })}>
            {comma($query.pointPurchase.paymentAmount)}원
          </dd>
        </div>
        <div class={flex({ align: 'center', borderTopWidth: '1px', borderTopColor: 'gray.200', fontSize: '14px' })}>
          <dt class={css({ padding: '14px', width: '120px' })}>입금기한</dt>
          <dd class={css({ padding: '14px', fontWeight: 'semibold' })}>
            {dayjs($query.pointPurchase.expiresAt).formatAsDateTime()}
          </dd>
        </div>
      </dl>
    </div>
  {:else}
    <div class={css({ width: 'full', maxWidth: '386px' })}>
      <div class={css({ gap: '12px' })}>
        <h1
          class={css({
            marginBottom: '4px',
            textAlign: 'center',
            fontSize: { base: '20px', sm: '24px' },
            fontWeight: 'bold',
          })}
        >
          포인트가 충전되었어요!
        </h1>
        <p class={css({ fontSize: { base: '14px', sm: '16px' }, textAlign: 'center', color: 'gray.600' })}>
          글리프의 다양한 작품을 감상해보세요
        </p>

        <dl
          class={css({
            marginTop: '20px',
            marginBottom: '16px',
            borderWidth: '1px',
            borderColor: 'gray.200',
          })}
        >
          <div class={flex({ align: 'center', fontSize: '14px' })}>
            <dt class={css({ padding: '14px', width: '120px' })}>충전 금액</dt>
            <dd class={css({ padding: '14px', fontWeight: 'semibold', color: 'brand.400' })}>
              {comma($query.pointPurchase.pointAmount)}P
            </dd>
          </div>

          <div class={flex({ align: 'center', borderTopWidth: '1px', borderTopColor: 'gray.200', fontSize: '14px' })}>
            <dt class={css({ padding: '14px', width: '120px' })}>충전 수단</dt>
            <dd class={css({ padding: '14px', fontWeight: 'semibold' })}>
              {paymentMethods[$query.pointPurchase.paymentMethod]}
            </dd>
          </div>
        </dl>
      </div>

      <Button
        style={css.raw({ display: 'block', width: 'full' })}
        href="/me/point"
        size="lg"
        type="link"
        variant="gradation-fill"
      >
        포인트 충전 내역 보기
      </Button>
    </div>
  {/if}
</div>
