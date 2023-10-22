<script lang="ts">
  import clsx from 'clsx';
  import qs from 'query-string';
  import { graphql } from '$glitch';
  import { Button } from '$lib/components';
  import { comma } from '$lib/utils';
  import type { PaymentMethod } from '$glitch';

  const purchasePoint = graphql(`
    mutation PointPurchasePage_PurchasePoint_Mutation($input: PurchasePointInput!) {
      purchasePoint(input: $input) {
        id
        paymentData
      }
    }
  `);

  const pointAmounts = [1000, 3000, 5000, 10_000, 30_000, 50_000, 100_000];
  const paymentMethods: [PaymentMethod, string][] = [
    ['CREDIT_CARD', '신용카드'],
    ['BANK_ACCOUNT', '계좌이체'],
    ['VIRTUAL_BANK_ACCOUNT', '가상계좌'],
    ['GIFTCARD_CULTURELAND', '문화상품권'],
    ['GIFTCARD_HAPPYMONEY', '해피머니'],
    ['PHONE_BILL', '휴대폰결제'],
    ['TOSS_PAY', '토스페이'],
    ['PAYPAL', '페이팔'],
  ];

  let pointAmount: number | null = null;
  let paymentMethod: PaymentMethod | null = null;

  const onClick = async () => {
    if (!pointAmount || !paymentMethod) {
      return;
    }

    const resp = await purchasePoint({
      paymentMethod,
      pointAmount,
    });

    // @ts-expect-error portone
    IMP.init('imp72534540');

    // @ts-expect-error portone
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    IMP.request_pay(resp.paymentData, async (resp: any) => {
      location.href = qs.stringifyUrl({
        url: '/api/payment/callback',
        query: { imp_uid: resp.imp_uid },
      });
    });
  };
</script>

<svelte:head>
  <script src="https://cdn.iamport.kr/v1/iamport.js">
  </script>
</svelte:head>

<div class="flex flex-col w-100 m-4 gap-4">
  <div class="flex flex-col border border-t-0 rounded bg-white">
    {#each pointAmounts as amount (amount)}
      <button
        class={clsx('flex px-4 py-2 border-t', pointAmount === amount && 'bg-green-20')}
        type="button"
        on:click={() => (pointAmount = amount)}
      >
        <div class="grow">{comma(amount)}원</div>
        <div>{comma(amount)} P</div>
        <div class="ml-4 square-4">
          {#if pointAmount === amount}
            <span class="text-green-50 i-lc-check" />
          {/if}
        </div>
      </button>
    {/each}
  </div>

  <div class="grid grid-cols-4 gap-4">
    {#each paymentMethods as [method, name] (method)}
      <button
        class={clsx('border rounded px-4 py-2', paymentMethod === method ? 'bg-green-20' : 'bg-white')}
        type="button"
        on:click={() => (paymentMethod = method)}
      >
        {name}
      </button>
    {/each}
  </div>

  <Button on:click={onClick}>결제하기</Button>
</div>
