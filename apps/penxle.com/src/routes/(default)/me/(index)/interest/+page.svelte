<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { Badge, Button } from '$lib/components';
  import SideMenu from '../SideMenu.svelte';
</script>

<Helmet title="관심 설정" />

<h1 class="hidden text-xl font-bold mb-5 sm:block">나의 펜슬</h1>

<div class="flex gap-10">
  <SideMenu />

  <div class="w-full max-w-200">
    <h2 class="hidden text-xl font-bold mb-6 sm:block">관심 설정</h2>
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
    </div>
  </div>
</div>
