<script lang="ts">
  import { onMount } from 'svelte';
  import { graphql } from '$glitch';
  import { comma } from '$lib/utils';

  $: query = graphql(`
    query PointPurchaseCompletePage_Query($paymentKey: String!) {
      pointPurchase(paymentKey: $paymentKey) {
        id
        state
        pointAmount
        paymentAmount
      }
    }
  `);

  let timer: NodeJS.Timeout | null = null;

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

<div class="flex flex-col">
  {#if $query.pointPurchase.state === 'PENDING'}
    결제가 진행중이에요
  {:else if $query.pointPurchase.state === 'COMPLETED'}
    결제가 완료되었어요
    <div class="mt-4 font-mono">
      결제된 금액: {comma($query.pointPurchase.paymentAmount)} 원
      <br />
      충전된 포인트: {comma($query.pointPurchase.pointAmount)} P
    </div>
  {/if}
</div>
