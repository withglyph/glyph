<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import PencilUnderline from '$assets/icons/pencil-underline.svg?component';
  import { Button } from '$lib/components';
  import TabContentItem from '$lib/components/TabContentItem.svelte';
  import TabHead from '$lib/components/TabHead.svelte';
  import TabHeadItem from '$lib/components/TabHeadItem.svelte';
  import Reply from './Reply.svelte';

  let activeTabValue = 1;
</script>

<Helmet title="나의 활동" />

<h1 class="hidden text-xl font-bold mb-5 sm:block">나의 펜슬</h1>

<div class="flex gap-10">
  <aside
    class="hidden w-full max-w-81.25 bg-white border border-gray-30 rounded-2xl px-4 py-10 h-full sm:block"
  >
    <div class="flex flex-col items-center gap-4 mb-6">
      <div class="square-20 bg-gray-90 rounded-full" />
      <div class="text-center">
        <p class="text-xl font-bold mb-2">닉네임</p>
        <p class="font-semibold text-gray-50">kylie@penxle.io</p>
      </div>
      <div
        class="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-gray-10 rounded-2.5"
      >
        <span class="font-bold">1000P</span>
        <Button color="secondary" size="md">충전하기</Button>
      </div>
      <Button class="w-full" color="tertiary" size="md" variant="outlined">
        <PencilUnderline class="square-5 mr-2" />
        프로필 수정
      </Button>
    </div>

    <nav>
      <ul>
        <li>
          <a
            class="flex items-center w-full inline-block p-3 h-15 font-bold rounded-1.5 transition hover:bg-gray-5 text-gray-40"
            href="/me/drawer"
          >
            나의 서랍
          </a>
        </li>
        <li>
          <a
            class="flex items-center w-full inline-block p-3 h-15 font-bold rounded-1.5 transition hover:bg-gray-5 text-gray-40"
            href="/me/interest"
          >
            관심 설정
          </a>
        </li>
        <li>
          <a
            class="flex items-center w-full inline-block p-3 h-15 font-bold rounded-1.5 transition hover:bg-gray-5 bg-gray-5"
            href="/me/activities"
          >
            나의 활동
          </a>
        </li>
        <li>
          <a
            class="flex items-center w-full inline-block p-3 h-15 font-bold rounded-1.5 transition hover:bg-gray-5 text-gray-40"
            href="/me/preference"
          >
            필터링 설정
          </a>
        </li>
        <li>
          <a
            class="flex items-center w-full inline-block p-3 h-15 font-bold rounded-1.5 transition hover:bg-gray-5 text-gray-40"
            href="/me/notification"
          >
            알림 설정
          </a>
        </li>
        <li>
          <a
            class="flex items-center w-full inline-block p-3 h-15 font-bold rounded-1.5 transition hover:bg-gray-5 text-gray-40"
            href="/me/account"
          >
            계정 설정
          </a>
        </li>
      </ul>
    </nav>
  </aside>

  <div class="w-full max-w-200">
    <h2 class="hidden text-xl font-bold mb-6 sm:block">나의 활동</h2>
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
</div>
