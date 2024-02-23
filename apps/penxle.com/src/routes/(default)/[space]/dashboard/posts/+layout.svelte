<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { TabHead, TabHeadItem } from '$lib/components/tab';
  import { pageSubTitle } from '$lib/stores';

  onMount(async () => {
    pageSubTitle.set('포스트 관리');
  });
</script>

<section class="flex flex-col gap-4 px-6 py-8 rounded-xl bg-white border border-secondary <sm:(my-5 mx-4)">
  <h1 class="title-20-eb">포스트 관리</h1>
  <div>
    <TabHead class="border-none" variant="secondary">
      <TabHeadItem id={0} pathname="/{$page.params.space}/dashboard/posts">포스트</TabHeadItem>
      <TabHeadItem id={1} pathname="/{$page.params.space}/dashboard/posts/collections">컬렉션</TabHeadItem>
    </TabHead>
    <hr class="w-full border-color-alphagray-10" />
  </div>
  <slot />
</section>
