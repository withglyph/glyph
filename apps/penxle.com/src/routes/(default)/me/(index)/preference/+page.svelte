<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import PencilUnderline from '$assets/icons/pencil-underline.svg?component';
  import { Button } from '$lib/components';
  import { Switch } from '$lib/components/forms';
</script>

<Helmet title="필터링 설정" />

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
            class="flex items-center w-full inline-block p-3 h-15 font-bold rounded-1.5 transition hover:bg-gray-5 bg-gray-5"
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
    <h2 class="hidden text-xl font-bold mb-6 sm:block">필터링 설정</h2>
    <div
      class="bg-white py-8 px-6 space-y-8 text-3.75 sm:(px-8 border border-gray-30 rounded-2xl)"
    >
      <div class="flex flex-col flex-wrap justify-center justify-between">
        <div class="flex items-center justify-between w-full mb-4">
          <button type="button">
            <h3 class="text-lg font-extrabold">안보기 처리한 스페이스</h3>
          </button>
          <button type="button">
            <span class="i-lc-chevron-right square-6" />
          </button>
        </div>
        <p class="text-3.75 text-gray-50">
          스페이스를 안보기 할 경우 해당 스페이스가 올린 포스트는 내 피드에
          올라오지 않습니다.
        </p>
        <p class="text-3.75 text-gray-50">
          위 기능은 스페이스에만 귀속되므로 안보기 처리한 스페이스의 멤버가 다른
          스페이스에서 올린 글은 노출될 수 있습니다.
        </p>
      </div>

      <div class="w-full border-b border-alphagray-15" />

      <div class="flex flex-col flex-wrap justify-center justify-between">
        <div class="flex items-center justify-between w-full mb-4">
          <button type="button">
            <h3 class="text-lg font-extrabold">안보기 처리한 태그</h3>
          </button>
          <button type="button">
            <span class="i-lc-chevron-right square-6" />
          </button>
        </div>
        <p class="text-3.75 text-gray-50">
          태그를 안보기 처리할 경우 해당 태그가 속해있는 포스트가 내 피드에
          보이지 않습니다.
        </p>
        <p class="text-3.75 text-gray-50">
          다른 태그를 포함하였더라도 안보기 처리한 태그가 함께 포함되어있는
          포스트는 내 피드에 노출되지 않습니다.
        </p>
      </div>

      <div class="w-full border-b border-alphagray-15" />

      <div class="flex flex-col flex-wrap justify-center justify-between">
        <div class="flex items-center justify-between w-full mb-4">
          <button type="button">
            <h3 class="text-lg font-extrabold">민감한 내용(주의요소) 표시</h3>
          </button>
          <Switch />
        </div>
        <p class="text-3.75 text-gray-50">
          포스트를 올릴 때 설정한 트리거 태그(유혈, 폭력 등) 여부에 대해 체크한
          포스팅이 노출되지 않습니다.
        </p>
        <div class="flex items-center gap-3 my-4">
          <p class="text-3.75 font-bold">민감한 내용 사전 블러 처리</p>
          <Switch />
        </div>
        <div class="text-gray-50 flex items-center gap-1 mb-4">
          <button class="text-3.25 font-bold" type="button">
            표시될 트리거워닝 세부 설정
          </button>
          <button type="button">
            <span class="i-lc-chevron-down square-3.5" />
          </button>
        </div>
        <div class="flex flex-wrap gap-3">
          <Button color="tertiary" size="md" variant="outlined">
            Button 1
          </Button>
          <Button color="tertiary" size="md" variant="outlined">
            Button 2
          </Button>
          <Button color="tertiary" size="md" variant="outlined">
            Button 3
          </Button>
          <Button color="tertiary" size="md" variant="outlined">
            Button 4
          </Button>
          <Button color="tertiary" size="md" variant="outlined">
            Button 5
          </Button>
          <Button color="tertiary" size="md" variant="outlined">
            Button 6
          </Button>
          <Button color="tertiary" size="md" variant="outlined">
            Button 7
          </Button>
          <Button color="tertiary" size="md" variant="outlined">
            Button 8
          </Button>
          <Button color="tertiary" size="md" variant="outlined">
            Button 9
          </Button>
          <Button color="tertiary" size="md" variant="outlined">
            Button 10
          </Button>
        </div>
      </div>

      <div class="w-full border-b border-alphagray-15" />

      <div class="flex flex-col flex-wrap justify-center justify-between">
        <div class="flex items-center justify-between w-full mb-4">
          <button type="button">
            <h3 class="text-lg font-extrabold">성인물 표시</h3>
          </button>
          <Switch />
        </div>
        <p class="text-3.75 text-gray-50">
          성인물에 해당하는 요소가 포함된 포스트가 노출되지 않습니다.
        </p>
        <div class="flex items-center gap-3 my-4">
          <p class="text-3.75 font-bold">민감한 내용 사전 블러 처리</p>
          <Switch />
        </div>
      </div>
    </div>
  </div>
</div>
