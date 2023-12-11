<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '$lib/components';
  import { TabHead, TabHeadItem } from '$lib/components/tab';
  import { pageSubTitle } from '$lib/stores';
  import { comma } from '$lib/utils';

  onMount(async () => {
    pageSubTitle.set('수익/정산');
  });
</script>

<h1 class="title-20-b">수익/정산</h1>

<div class="mt-6 flex items-center gap-6">
  <div class="text-black body-16-m">카카오뱅크 3333-02-5063260</div>
  <Button color="tertiary" size="sm" variant="outlined">출금계좌 변경</Button>
</div>

<div class="mt-6 flex flex-col py-4 bg-white border border-secondary rounded-2xl">
  <div class="flex flex-col gap-2 px-8 pt-2">
    <hr class="border-t-0 border-b-1 border-alphagray-10" />
    <div class="flex gap-2 py-2">
      <div class="subtitle-18-eb flex-1">누적 수익금</div>
      <div class="subtitle-18-eb">{comma(0)}원</div>
    </div>
  </div>
  <div class="flex flex-col gap-2 px-8 pt-2">
    <hr class="border-t-0 border-b-1 border-alphagray-10" />
    <div class="flex gap-2 py-2">
      <div class="subtitle-18-eb flex-1">누적 정산액</div>
      <div class="subtitle-18-eb">{comma(0)}원</div>
    </div>
  </div>
  <div class="flex flex-col gap-2 px-8 pt-2">
    <hr class="border-t-0 border-b-1 border-alphagray-10" />
    <div class="flex gap-2 py-2">
      <div class="subtitle-18-eb flex-1">지급 대기</div>
      <div class="subtitle-18-eb">{comma(0)}원</div>
    </div>
  </div>
  <div class="flex flex-col gap-2 px-8 pt-2">
    <hr class="border-t-0 border-b-1 border-alphagray-10" />
    <div class="flex gap-2 py-2">
      <div class="subtitle-18-eb flex-1">정산 가능</div>
      <div class="subtitle-18-eb">{comma(1234)}원</div>
      <Button size="sm">받기</Button>
    </div>
  </div>
</div>

<div class="mt-6 flex flex-col gap-4 py-8 bg-white border border-secondary rounded-2xl">
  <h2 class="title-20-b px-6">수익/정산 내역</h2>
  <TabHead class="w-full px-6" variant="secondary">
    <TabHeadItem id={1} href="/me/revenue">수익</TabHeadItem>
    <TabHeadItem id={2} href="/me/revenue/settlement">정산</TabHeadItem>
  </TabHead>
  <div class="px-6">
    <slot />
  </div>
</div>
