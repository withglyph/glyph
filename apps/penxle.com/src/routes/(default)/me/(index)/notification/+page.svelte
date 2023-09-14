<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { Switch } from '$lib/components/forms';
  import SideMenu from '../SideMenu.svelte';
</script>

<Helmet title="알림 설정" />

<h1 class="hidden text-xl font-bold mb-5 sm:block">나의 펜슬</h1>

<div class="flex gap-10">
  <SideMenu />

  <div class="w-full max-w-200">
    <h2 class="hidden text-xl font-bold mb-6 sm:block">알림 설정</h2>
    <div class="bg-white sm:(space-y-8 border border-gray-30 rounded-2xl p-8)">
      <div class="hidden justify-end gap-8 text-3.75 text-gray-50 sm:flex">
        <span>웹사이트</span>
        <span>이메일</span>
      </div>
      <div
        class="flex flex-wrap items-center justify-between gap-4 pt-14 py-4 px-6 sm:p-0"
      >
        <div class="text-lg font-extrabold">알림 전체 켜기 / 끄기</div>
        <Switch class="sm:hidden" />
        <div class="hidden sm:(flex gap-8)">
          <Switch />
          <Switch />
        </div>
      </div>

      <div
        class="flex flex-col flex-wrap justify-center sm:(flex-row items-center justify-between flex-nowrap)"
      >
        <div class="flex items-center justify-between py-4 px-6 sm:p-0">
          <div>
            <div class="text-lg font-extrabold">댓글</div>
            <p class="text-3.75 text-gray-50">
              내 포스트에 댓글이 달렸을 때 알림을 받습니다.
            </p>
          </div>
          <span class="i-lc-chevron-down sm:hidden" />
        </div>
        <div
          class="flex flex-col bg-gray-10 py-4 px-6 space-y-6 sm:(space-y-0 flex-row items-center p-0 bg-white gap-8)"
        >
          <div class="flex justify-between sm:block">
            <span class="font-semibold sm:hidden">웹사이트</span>
            <Switch />
          </div>
          <div class="flex justify-between sm:block">
            <span class="font-semibold sm:hidden">이메일</span>
            <Switch />
          </div>
        </div>
      </div>

      <div
        class="flex flex-col flex-wrap justify-center sm:(flex-row items-center justify-between flex-nowrap)"
      >
        <div class="flex items-center justify-between py-4 px-6 sm:p-0">
          <div>
            <div class="text-lg font-extrabold">답글</div>
            <p class="text-3.75 text-gray-50">
              댓글에 대댓글이 달렸을 때 알림을 받습니다.
            </p>
          </div>
          <span class="i-lc-chevron-down sm:hidden" />
        </div>
        <div
          class="flex flex-col bg-gray-10 py-4 px-6 space-y-6 sm:(space-y-0 flex-row items-center p-0 bg-white gap-8)"
        >
          <div class="flex justify-between sm:block">
            <span class="font-semibold sm:hidden">웹사이트</span>
            <Switch />
          </div>
          <div class="flex justify-between sm:block">
            <span class="font-semibold sm:hidden">이메일</span>
            <Switch />
          </div>
        </div>
      </div>

      <div
        class="flex flex-col flex-wrap justify-center sm:(flex-row items-center justify-between flex-nowrap)"
      >
        <div class="flex items-center justify-between py-4 px-6 sm:p-0">
          <div>
            <div class="text-lg font-extrabold">스페이스 구독</div>
            <p class="text-3.75 text-gray-50">
              스페이스 구독자가 생겼을 때 알림을 받습니다.
            </p>
          </div>
          <span class="i-lc-chevron-down sm:hidden" />
        </div>
        <div
          class="flex flex-col bg-gray-10 py-4 px-6 space-y-6 sm:(space-y-0 flex-row items-center p-0 bg-white gap-8)"
        >
          <div class="flex justify-between sm:block">
            <span class="font-semibold sm:hidden">웹사이트</span>
            <Switch />
          </div>
          <div class="flex justify-between sm:block">
            <span class="font-semibold sm:hidden">이메일</span>
            <Switch />
          </div>
        </div>
      </div>

      <div
        class="flex flex-col flex-wrap justify-center sm:(flex-row items-center justify-between flex-nowrap)"
      >
        <div class="flex items-center justify-between py-4 px-6 sm:p-0">
          <div>
            <div class="text-lg font-extrabold">태그 수정</div>
            <p class="text-3.75 text-gray-50">
              내 포스트 태그를 수정했을 때 알림을 받습니다.
            </p>
          </div>
          <span class="i-lc-chevron-down sm:hidden" />
        </div>
        <div
          class="flex flex-col bg-gray-10 py-4 px-6 space-y-6 sm:(space-y-0 flex-row items-center p-0 bg-white gap-8)"
        >
          <div class="flex justify-between sm:block">
            <span class="font-semibold sm:hidden">웹사이트</span>
            <Switch />
          </div>
          <div class="flex justify-between sm:block">
            <span class="font-semibold sm:hidden">이메일</span>
            <Switch />
          </div>
        </div>
      </div>

      <div
        class="flex flex-col flex-wrap justify-center sm:(flex-row items-center justify-between flex-nowrap)"
      >
        <div class="flex items-center justify-between py-4 px-6 sm:p-0">
          <div>
            <div class="text-lg font-extrabold">조회수</div>
            <p class="text-3.75 text-gray-50">
              조회수가 급상승했을 때 알림을 받습니다.
            </p>
          </div>
          <span class="i-lc-chevron-down sm:hidden" />
        </div>
        <div
          class="flex flex-col bg-gray-10 py-4 px-6 space-y-6 sm:(space-y-0 flex-row items-center p-0 bg-white gap-8)"
        >
          <div class="flex justify-between sm:block">
            <span class="font-semibold sm:hidden">웹사이트</span>
            <Switch />
          </div>
          <div class="flex justify-between sm:block">
            <span class="font-semibold sm:hidden">이메일</span>
            <Switch />
          </div>
        </div>
      </div>

      <div
        class="flex flex-col flex-wrap justify-center sm:(flex-row items-center justify-between flex-nowrap)"
      >
        <div class="flex items-center justify-between py-4 px-6 sm:p-0">
          <div>
            <div class="text-lg font-extrabold">구매</div>
            <p class="text-3.75 text-gray-50">
              내 포스트가 구매되었을 때 알림을 받습니다.
            </p>
          </div>
          <span class="i-lc-chevron-down sm:hidden" />
        </div>
        <div
          class="flex flex-col bg-gray-10 py-4 px-6 space-y-6 sm:(space-y-0 flex-row items-center p-0 bg-white gap-8)"
        >
          <div class="flex justify-between sm:block">
            <span class="font-semibold sm:hidden">웹사이트</span>
            <Switch />
          </div>
          <div class="flex justify-between sm:block">
            <span class="font-semibold sm:hidden">이메일</span>
            <Switch />
          </div>
        </div>
      </div>

      <div
        class="flex flex-col flex-wrap justify-center sm:(flex-row items-center justify-between flex-nowrap)"
      >
        <div class="flex items-center justify-between py-4 px-6 sm:p-0">
          <div>
            <div class="text-lg font-extrabold">후원</div>
            <p class="text-3.75 text-gray-50">
              내 포스트에 후원을 받았을 때 알림을 받습니다.
            </p>
          </div>
          <span class="i-lc-chevron-down sm:hidden" />
        </div>
        <div
          class="flex flex-col bg-gray-10 py-4 px-6 space-y-6 sm:(space-y-0 flex-row items-center p-0 bg-white gap-8)"
        >
          <div class="flex justify-between sm:block">
            <span class="font-semibold sm:hidden">웹사이트</span>
            <Switch />
          </div>
          <div class="flex justify-between sm:block">
            <span class="font-semibold sm:hidden">이메일</span>
            <Switch />
          </div>
        </div>
      </div>

      <div
        class="flex flex-col flex-wrap justify-center sm:(flex-row items-center justify-between flex-nowrap)"
      >
        <div class="flex items-center justify-between py-4 px-6 sm:p-0">
          <div>
            <div class="text-lg font-extrabold">태그 위키 수정</div>
            <p class="text-3.75 text-gray-50">
              내가 작성한 태그가 수정됐을 때 알림을 받습니다.
            </p>
          </div>
          <span class="i-lc-chevron-down sm:hidden" />
        </div>
        <div
          class="flex flex-col bg-gray-10 py-4 px-6 space-y-6 sm:(space-y-0 flex-row items-center p-0 bg-white gap-8)"
        >
          <div class="flex justify-between sm:block">
            <span class="font-semibold sm:hidden">웹사이트</span>
            <Switch />
          </div>
          <div class="flex justify-between sm:block">
            <span class="font-semibold sm:hidden">이메일</span>
            <Switch />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
