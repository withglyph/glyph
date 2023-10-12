<script lang="ts">
  import TabHead from '$lib/components/tab/TabHead.svelte';
  import TabHeadItem from '$lib/components/tab/TabHeadItem.svelte';
</script>

<div class="bg-white text-3.75 sm:(border border-gray-30 rounded-2xl)">
  <h2 class="title-20-eb mt-8 mb-4 <sm:hidden px-8">설정</h2>

  <TabHead class="w-full sm:px-8" variant="secondary">
    <TabHeadItem id={1} href="/me/settings" variant="secondary">계정</TabHeadItem>
    <TabHeadItem id={2} href="/me/settings/notifications" variant="secondary">알림</TabHeadItem>
    <TabHeadItem id={3} href="/me/settings/contentfilters" variant="secondary">필터링</TabHeadItem>
  </TabHead>

  <slot />
</div>
