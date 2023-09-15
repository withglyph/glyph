<script lang="ts">
  import clsx from 'clsx';
  import { page } from '$app/stores';
  import PencilUnderline from '$assets/icons/pencil-underline.svg?component';
  import { Button } from '$lib/components';
</script>

<div class="w-full max-w-291.25 flex flex-col sm:m-10">
  <h1 class="hidden text-xl font-bold mb-5 sm:block">나의 펜슬</h1>
  <div class="flex gap-10">
    <aside
      class={clsx(
        'hidden w-81.25 bg-white border border-gray-30 rounded-2xl px-4 py-10 h-full sm:block',
        $page.url.pathname === '/me' &&
          'block! border-white w-full max-w-screen rounded-0!',
      )}
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
              class={clsx(
                'flex items-center w-full inline-block p-3 h-15 font-bold rounded-1.5 transition hover:bg-gray-5 text-gray-40',
                $page.url.pathname === '/me/drawer' && 'bg-gray-5 text-gray-90',
              )}
              href="/me/drawer"
            >
              나의 서랍
            </a>
          </li>
          <li>
            <a
              class={clsx(
                'flex items-center w-full inline-block p-3 h-15 font-bold rounded-1.5 transition hover:bg-gray-5 text-gray-40',
                $page.url.pathname === '/me/interest' &&
                  'bg-gray-5 text-gray-90',
              )}
              href="/me/interest"
            >
              관심 설정
            </a>
          </li>
          <li>
            <a
              class={clsx(
                'flex items-center w-full inline-block p-3 h-15 font-bold rounded-1.5 transition hover:bg-gray-5 text-gray-40',
                $page.url.pathname === '/me/activities' &&
                  'bg-gray-5 text-gray-90',
              )}
              href="/me/activities"
            >
              나의 활동
            </a>
          </li>
          <li>
            <a
              class={clsx(
                'flex items-center w-full inline-block p-3 h-15 font-bold rounded-1.5 transition hover:bg-gray-5 text-gray-40',
                $page.url.pathname === '/me/preference' &&
                  'bg-gray-5 text-gray-90',
              )}
              href="/me/preference"
            >
              필터링 설정
            </a>
          </li>
          <li>
            <a
              class={clsx(
                'flex items-center w-full inline-block p-3 h-15 font-bold rounded-1.5 transition hover:bg-gray-5 text-gray-40',
                $page.url.pathname === '/me/notification' &&
                  'bg-gray-5 text-gray-90',
              )}
              href="/me/notification"
            >
              알림 설정
            </a>
          </li>
          <li>
            <a
              class={clsx(
                'flex items-center w-full inline-block p-3 h-15 font-bold rounded-1.5 transition hover:bg-gray-5 text-gray-40',
                $page.url.pathname === '/me/account' &&
                  'bg-gray-5 text-gray-90',
              )}
              href="/me/account"
            >
              계정 설정
            </a>
          </li>
        </ul>
      </nav>
    </aside>

    <slot />
  </div>
</div>
