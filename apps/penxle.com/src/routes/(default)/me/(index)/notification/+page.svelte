<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { Switch } from '$lib/components/forms';
  import Notification from './Notification.svelte';
</script>

<Helmet title="알림 설정" />

<div class="w-full max-w-200">
  <h2 class="text-xl font-bold mb-6 <sm:hidden">알림 설정</h2>
  <div class="bg-white sm:(space-y-8 border border-gray-30 rounded-2xl p-8)">
    <div class="hidden justify-end gap-8 text-3.75 text-gray-50 sm:flex">
      <span>웹사이트</span>
      <span>이메일</span>
    </div>
    <div
      class="flex flex-wrap items-center justify-between gap-4 pt-14 py-4 px-6 sm:p-0"
    >
      <div class="text-lg font-extrabold">알림 전체 켜기 / 끄기</div>
      <Switch class="sm:hidden" checked />
      <div class="hidden sm:(flex gap-8)">
        <Switch checked />
        <Switch checked />
      </div>
    </div>

    <Notification
      name="댓글"
      content="내 포스트에 댓글이 달렸을 때 알림을 받아요."
    />

    <Notification
      name="답글"
      content="댓글에 답글이 달렸을 때 알림을 받아요."
    />

    <Notification
      name="스페이스 구독"
      content="스페이스 구독자가 생겼을 때 알림을 받아요."
    />

    <Notification
      name="태그 수정"
      content="내 포스트 태그를 수정했을 때 알림을 받아요."
    />

    <Notification
      name="조회수"
      content="조회수가 급상승했을 때 알림을 받아요."
    />

    <Notification
      name="구매"
      content="내 포스트가 구매됐을 때 알림을 받아요."
    />

    <Notification
      name="후원"
      content="내 포스트에 후원을 받았을 때 알림을 받아요."
    />

    <Notification
      name="태그 위키 수정"
      content="내가 작성한 태그가 수정됐을 때 알림을 받아요."
    />
  </div>
</div>
