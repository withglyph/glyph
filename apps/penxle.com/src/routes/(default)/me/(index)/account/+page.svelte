<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import Google from '$assets/icons/google.svg?component';
  import Naver from '$assets/icons/naver.svg?component';
  import { Badge, Button } from '$lib/components';
  import SideMenu from '../SideMenu.svelte';
  import UpdateProfileModal from './UpdateProfileModal.svelte';

  let open = false;
</script>

<Helmet title="계정 설정" />

<h1 class="hidden text-xl font-bold mb-5 sm:block">나의 펜슬</h1>

<div class="flex gap-10">
  <SideMenu />

  <div class="w-full max-w-200">
    <h2 class="hidden text-xl font-bold mb-6 sm:block">계정 설정</h2>
    <div
      class="bg-white py-8 px-6 space-y-8 text-3.75 sm:(px-8 border border-gray-30 rounded-2xl)"
    >
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="square-12.5 bg-gray-90 rounded-full" />
          <div>
            <div class="flex flex-wrap">
              <span class="text-lg font-extrabold mr-2">닉네임</span>
              <Badge class="text-xs font-bold" color="red">
                이메일 인증 필요
              </Badge>
            </div>
            <span class="text-3.75 text-gray-50">kylie@penxle.io</span>
          </div>
        </div>
        <Button color="tertiary" size="md">프로필 수정</Button>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div class="flex flex-wrap mb-2">
            <h3 class="text-lg font-extrabold mr-2">이메일 인증</h3>
            <Badge class="text-xs font-bold" color="red">인증 필요</Badge>
          </div>
        </div>
        <div class="flex">
          <Button color="tertiary" size="md" variant="outlined">
            변경하기
          </Button>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div class="flex flex-wrap mb-2">
            <h3 class="text-lg font-extrabold mr-2">본인 인증</h3>
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
            <h3 class="text-lg font-extrabold mr-2">성인 인증</h3>
            <Badge class="text-xs font-bold" color="red">인증 필요</Badge>
          </div>
          <p class="text-3.75 text-gray-50 break-keep">
            펜슬의 콘텐츠를 이용하려면 성인 인증이 필요해요
          </p>
        </div>
      </div>

      <div class="w-full border-b border-alphagray-15" />

      <h3 class="text-lg font-extrabold mb-4">연동 관리</h3>
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="square-9 flex center">
            <Google class="square-9" />
          </div>
          <div>
            <h3 class="text-lg font-extrabold mr-2">Google</h3>
            <p class="text-3.75 text-gray-50 break-keep">kylie@penxle.io</p>
          </div>
        </div>
        <Button color="tertiary" size="md" variant="outlined">연동 해제</Button>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="square-9 flex center">
            <Naver class="square-7.5" />
          </div>
          <div>
            <h3 class="text-lg font-extrabold mr-2">Naver</h3>
          </div>
        </div>
        <Button color="tertiary" size="md">연동하기</Button>
      </div>

      <div class="w-full border-b border-alphagray-15" />

      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 class="text-lg font-extrabold mb-2">마케팅 수신 동의</h3>
          <p class="text-3.75 text-gray-50 break-keep">2023.04.08 승인됨</p>
        </div>
        <Button color="tertiary" size="md">인증하기</Button>
      </div>

      <div class="w-full border-b border-alphagray-15" />

      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 class="text-lg font-extrabold mb-2">비밀번호</h3>
          <p class="text-3.75 text-gray-50 break-keep">비밀번호를 변경하세요</p>
        </div>
        <Button color="tertiary" size="md">변경하기</Button>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 class="text-lg font-extrabold mb-2">2차 인증</h3>
          <p class="text-3.75 text-gray-50 break-keep">
            2차 인증을 통해 계정을 더욱 안전하게 관리하세요
          </p>
        </div>
        <Button color="tertiary" size="md">인증하기</Button>
      </div>

      <div class="w-full border-b border-alphagray-15" />

      <div class="flex justify-end">
        <Button size="lg" variant="text">
          탈퇴하기
          <span class="i-lc-chevron-right" />
        </Button>
      </div>
    </div>
  </div>
</div>

<UpdateProfileModal bind:open />
