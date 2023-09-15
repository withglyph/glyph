<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import TabContentItem from '$lib/components/TabContentItem.svelte';
  import TabHead from '$lib/components/TabHead.svelte';
  import TabHeadItem from '$lib/components/TabHeadItem.svelte';
  import Reply from './Reply.svelte';

  let activeTabValue = 1;
</script>

<Helmet title="나의 활동" />

<div class="w-full max-w-200">
  <h2 class="text-xl font-bold mb-6 <sm:hidden">나의 활동</h2>
  <div>
    <TabHead variant="secondary">
      <TabHeadItem
        id={1}
        {activeTabValue}
        variant="secondary"
        on:click={() => (activeTabValue = 1)}
      >
        <span>내가 작성한 포스트</span>
      </TabHeadItem>
      <TabHeadItem
        id={2}
        {activeTabValue}
        variant="secondary"
        on:click={() => (activeTabValue = 2)}
      >
        <span>내가 작성한 댓글</span>
      </TabHeadItem>
    </TabHead>
    <TabContentItem id={1} {activeTabValue}>
      <div
        class="flex items-center gap-2 px-4 h-10 text-lg font-extrabold my-2 sm:my-4"
      >
        <h3>작성한 포스트</h3>
        <span class="text-gray-50">7</span>
      </div>
    </TabContentItem>
    <TabContentItem id={2} {activeTabValue}>
      <Reply />
    </TabContentItem>
  </div>
</div>
