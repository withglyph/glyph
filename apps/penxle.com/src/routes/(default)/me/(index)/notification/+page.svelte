<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import PencilUnderline from '$assets/icons/pencil-underline.svg?component';
  import { Button } from '$lib/components';
  import { Switch } from '$lib/components/forms';
</script>

<Helmet title="알림 설정" />

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
            class="flex items-center w-full inline-block p-3 h-15 font-bold rounded-1.5 transition hover:bg-gray-5 text-gray-40"
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
            class="flex items-center w-full inline-block p-3 h-15 font-bold rounded-1.5 transition hover:bg-gray-5 bg-gray-5"
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
