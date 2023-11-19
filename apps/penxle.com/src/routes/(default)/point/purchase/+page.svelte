<script lang="ts">
  import clsx from 'clsx';
  import qs from 'query-string';
  import Paypal from '$assets/icons/paypal.svg?component';
  import Toss from '$assets/icons/toss.svg?component';
  import { graphql } from '$glitch';
  import { Button } from '$lib/components';
  import { Checkbox } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { comma } from '$lib/utils';
  import { PurchasePointSchema } from '$lib/validations';
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
    },
  });

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
</script>

<svelte:head>
  <script src="https://cdn.iamport.kr/v1/iamport.js">
  </script>
</svelte:head>

<form class="space-y-6 flex flex-col center my-9 w-full max-w-200 px-4 sm:my-22" use:form>
  <h1 class="title-20-b w-full">포인트 충전</h1>

  <p class="w-full flex items-center gap-2">
    <span>보유중인 포인트 :</span>
    <span class="title-20-b">{comma($query.me.point)}P</span>
  </p>

  <div class="w-full p-4 bg-cardprimary border border-secondary rounded-2xl">
    <div class="flex flex-col">
      <div class="flex px-4 py-2 border bg-primary border-secondary text-secondary rounded-lg body-13-m">
        <div class="mr-4">선택</div>
        <div class="grow">충전 포인트</div>
        <div>금액</div>
      </div>
      {#each pointAmounts as amount (amount)}
        <button
          class={clsx(
            'flex items-center p-4 border-t hover:bg-primary first-of-type:border-0',
            $data.pointAmount === amount && 'bg-primary',
          )}
          type="button"
          on:click={() => ($data.pointAmount = amount)}
        >
          <input class="mr-6 square-4 cursor-pointer" checked={$data.pointAmount === amount} type="radio" />
          <label class="grow body-16-b cursor-pointer" for={`${amount}`}>{comma(amount)}P</label>
          <div>{comma(amount)}원</div>
        </button>
      {/each}
    </div>
  </div>

  <p class="w-full">결제수단</p>

  <div class="grid grid-cols-4 gap-4 w-full">
    {#each paymentMethods as [method, name] (method)}
      <Button
        class={clsx($data.paymentMethod === method && 'bg-surface-primary! border-tertiary')}
        color="tertiary"
        size="xl"
        variant="outlined"
        on:click={() => ($data.paymentMethod = method)}
      >
        {#if method === 'TOSS_PAY'}
          <Toss class="h-5" />
        {:else if method === 'PAYPAL'}
          <Paypal class="h-5" />
        {:else}
          {name}
        {/if}
      </Button>
    {/each}
  </div>

  <div class="bg-surface-primary rounded-2xl p-4 w-full">
    <p class="flex items-center body-13-b gap-2">
      <i class="i-lc-alert-triangle" />
      <span>결제 전 확인해주세요!</span>
    </p>
    <div class="mt-2 text-secondary body-13-m">
      <p>
        - 충전한 포인트 전액 결제 취소는 포인트를 구매한 뒤 사용한 이력이 없고 결제 후 7일 이내에 결제 취소한 경우에
        가능합니다.
      </p>
      <p>
        - 포인트는 결제한 날로부터 1년이 되는 시점에 소멸됩니다. 단, 직접 회원 탈퇴해서 계정이 삭제되면 그 즉시 소멸되어
        복구할 수 없습니다.
      </p>
      <p>
        - 잔여 포인트는 충전한 포인트의 잔액이 80% 이하일 때에 한해 환불 신청이 가능하며, 잔액의 10% 또는 1,000원 중 큰
        금액을 환급 수수료로 제외하고 환불해드립니다. 포인트 잔액이 1,000원 이하이면 환불이 불가능합니다. 환불은
        <a class="underline" href="https://help.penxle.com/">펜슬 도움 센터</a>
        를 통해 신청할 수 있습니다.
      </p>
      <p>- 무료로 지급받은 포인트는 환불받을 수 없으며, 지급일로부터 1년이 되는 시점에 소멸됩니다.</p>
      <p>
        - 환불 페이지의 모든 양식을 기입하여 제출하면 즉시 잔여 포인트가 차감됩니다. 환불한 금액은 영업일 기준으로 5일
        안에 환불 계좌로 입금해 드립니다.
      </p>
      <p>
        - 미성년자는 포인트를 충전하기 전에 부모 등 법정 대리인의 동의를 받아야 합니다. 법정대리인이 동의하지 않으면
        미성년자 본인 또는 법정대리인이 이용 계약을 취소할 수 있습니다.
      </p>
      <p>
        - 자세한 내용은 서비스 이용 전 동의하신
        <a class="underline" href="https://help.penxle.com/legal/terms">이용약관</a>
        을 참조해주시기 바랍니다.
      </p>
    </div>
  </div>

  <Checkbox name="pointAgreement" class="body-14-m">
    주문 내용과 아래 유의 사항을 확인하였으며 결제 진행에 동의합니다.
  </Checkbox>

  <Button class="w-full max-w-125" size="xl" type="submit">포인트 충전하기</Button>

  <p class="flex items-center gap-2">
    <span>충전 후 보유 포인트 :</span>
    <span class="title-20-b">{comma($query.me.point + ($data.pointAmount ?? 0))}P</span>
  </p>
</form>
