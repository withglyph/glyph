<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { Badge, Button } from '$lib/components';
  import UpdateProfileModal from './UpdateProfileModal.svelte';

  let open = false;
</script>

<Helmet title="계정 설정" />

<!-- <div
  class="w-full max-w-81.25 bg-white border border-gray-30 rounded-2xl px-4 py-10"
>
</div> -->

<Button
  color="tertiary"
  size="md"
  variant="outlined"
  on:click={() => (open = true)}
>
  프로필 수정
</Button>

<div
  class="w-full max-w-200 mx-auto bg-white py-8 px-6 space-y-8 text-3.75 sm:(px-8 border border-gray-30 rounded-2xl)"
>
  <div class="flex flex-wrap items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="square-12.5 bg-gray-90 rounded-full" />
      <div>
        <div class="flex flex-wrap">
          <span class="text-lg font-extrabold mr-2">닉네임</span>
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
    </div>
    <div class="flex">
      <Button color="tertiary" size="md">변경하기</Button>
      <Button color="tertiary" size="md">해제하기</Button>
    </div>
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

  <div class="w-full h-2.5 bg-alphagray-15" />
</div>

<UpdateProfileModal bind:open />
