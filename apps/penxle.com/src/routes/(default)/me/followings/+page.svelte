<script lang="ts">
  import { Helmet } from '@penxle/ui';
</script>

<Helmet title="관심 설정" />

<h2 class="text-xl font-bold mb-6 <sm:hidden">관심 설정</h2>
<div class="flex flex-col gap-2 sm:(flex-row gap-9)">
  <div class="bg-white pt-3 pb-5 px-6 space-y-2 text-3.75 sm:(px-8 border border-gray-30 rounded-2xl max-w-50%)">
    <div class="h-10 flex items-center gap-2 text-lg font-extrabold">
      <h3>관심 스페이스</h3>
      <span class="text-gray-50">7</span>
      <span class="i-lc-chevron-right square-6 text-gray-50" />
    </div>

    <div class="py-2 flex gap-2 items-center">
      <div class="bg-black square-10.5 rounded-2" />
      <div class="truncate">
        <p class="mb-1 text-3.75">스페이스 명</p>
        <p class="text-3.25 text-gray-50 truncate">스페이스 설명</p>
      </div>
    </div>
  </div>

  <div class="bg-white pt-3 pb-5 px-6 space-y-2 text-3.75 sm:(px-8 border border-gray-30 rounded-2xl max-w-50%)">
    <div class="h-10 flex items-center gap-2 text-lg font-extrabold">
      <h3>관심 스페이스</h3>
      <span class="text-gray-50">7</span>
      <span class="i-lc-chevron-right square-6 text-gray-50" />
    </div>

    <div class="py-2 flex gap-2 items-center">
      <div class="bg-black square-10.5 rounded-2" />
      <div class="truncate">
        <p class="mb-1 text-3.75">스페이스 명</p>
        <p class="text-3.25 text-gray-50 truncate">스페이스 설명</p>
      </div>
    </div>
  </div>
</div>
