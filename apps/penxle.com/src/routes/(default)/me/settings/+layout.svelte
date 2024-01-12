<script lang="ts">
  import TabHead from '$lib/components/tab/TabHead.svelte';
  import TabHeadItem from '$lib/components/tab/TabHeadItem.svelte';
</script>

<div class="bg-white text-3.75 sm:(border border-secondary rounded-2xl)">
  <h2 class="title-20-eb mt-8 mb-4 <sm:hidden px-8">설정</h2>

  <TabHead class="w-full sm:px-8" variant="secondary">
    <TabHeadItem id={1} pathname="/me/settings">계정</TabHeadItem>
    <TabHeadItem id={2} pathname="/me/settings/notifications">알림</TabHeadItem>
    <TabHeadItem id={3} pathname="/me/settings/contentfilters">필터링</TabHeadItem>
  </TabHead>

  <slot />
</div>
