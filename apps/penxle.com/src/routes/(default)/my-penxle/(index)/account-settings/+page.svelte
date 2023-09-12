<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { Badge, Button } from '$lib/components';
</script>

<Helmet title="계정 설정" />

<div
  class="w-full max-w-200 mx-auto bg-white rounded-2xl border border-gray-30 py-8 px-6 sm:px-8 space-y-8 text-3.75"
>
  <div class="flex flex-wrap items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="square-12.5 bg-gray-90 rounded-full" />
      <div>
        <div class="flex flex-wrap">
          <span class="text-lg font-extrabold mr-2">Kylie</span>
          <Badge class="text-xs font-bold" color="red">이메일 인증 필요</Badge>
        </div>
        <span class="text-3.75 text-gray-50">kylie@penxle.io</span>
      </div>
    </div>
    <Button color="tertiary" size="md">프로필 수정</Button>
  </div>

  <div class="flex flex-wrap items-center justify-between gap-4">
    <div>
      <div class="flex flex-wrap mb-2">
        <h2 class="text-lg font-extrabold mr-2">이메일 인증</h2>
        <Badge class="text-xs font-bold" color="red">인증 필요</Badge>
      </div>
      <p class="text-3.75 text-gray-50 break-keep">
        펜슬의 콘텐츠를 이용하려면 이메일 인증이 필요해요
      </p>
    </div>
    <Button color="tertiary" size="md">인증하기</Button>
  </div>

  <div class="flex flex-wrap items-center justify-between gap-4">
    <div>
      <div class="flex flex-wrap mb-2">
        <h2 class="text-lg font-extrabold mr-2">본인 인증</h2>
        <Badge class="text-xs font-bold mr-2" color="red">인증 필요</Badge>
        <Badge class="text-xs font-bold" color="gray">만료됨</Badge>
      </div>
      <p class="text-3.75 text-gray-50 break-keep">
        펜슬의 콘텐츠를 이용하려면 본인 인증이 필요해요
      </p>
    </div>
    <Button color="tertiary" size="md">인증하기</Button>
  </div>

  <div class="flex flex-wrap items-center justify-between gap-4">
    <div>
      <div class="flex flex-wrap mb-2">
        <h2 class="text-lg font-extrabold mr-2">성인 인증</h2>
        <Badge class="text-xs font-bold" color="red">인증 필요</Badge>
      </div>
      <p class="text-3.75 text-gray-50 break-keep">
        펜슬의 콘텐츠를 이용하려면 성인 인증이 필요해요
      </p>
    </div>
  </div>

  <br class="w-full h-3 bg-gray-30" />
</div>
