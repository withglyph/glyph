<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import dayjs from 'dayjs';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { Avatar, Badge, Button } from '$lib/components';
  import { Switch } from '$lib/components/forms';
  import { toast } from '$lib/notification';
  import UpdateEmailModal from './UpdateEmailModal.svelte';
  import UpdateProfileModal from './UpdateProfileModal.svelte';
  import UserSingleSignOn from './UserSingleSignOn.svelte';

  let updateEmailOpen = false;
  let updateProfileOpen = false;

  $: query = graphql(`
    query MeSettingsPage_Query {
      auth(scope: USER)

      me @_required {
        id
        email
        state

        marketingConsent {
          id
          createdAt
        }

        profile {
          id
          name

          ...Avatar_profile
          ...MeSettingsPage_UpdateProfileModal_profile
        }

        ...MeSettingsPage_UserSingleSignOn_user
      }
    }
  `);

  const updateUserMarketingConsent = graphql(`
    mutation MeSettingsPage_UpdateUserMarketingConsent_Mutation($input: UpdateUserMarketingConsentInput!) {
      updateUserMarketingConsent(input: $input) {
        id

        marketingConsent {
          id
          createdAt
        }
      }
    }
  `);

  onMount(() => {
    switch ($page.url.searchParams.get('message')) {
      case 'sso_already_linked_by_other':
        toast.error('이 소셜 계정은 이미 다른 펜슬 계정에 연동되어 있어요.');
        break;
    }
  });
</script>

<Helmet title="계정 설정" />

<div class="py-8 px-6 space-y-8 sm:px-8">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <Avatar class="square-12.5" $profile={$query.me.profile} />
      <div class="flex flex-col flex-wrap">
        <span class="text-lg font-extrabold mr-2">
          {$query.me.profile.name}
        </span>
        <span class="text-3.75 text-secondary">{$query.me.email}</span>
      </div>
    </div>
    <Button color="secondary" size="md" on:click={() => (updateProfileOpen = true)}>프로필 수정</Button>
  </div>

  <div class="flex flex-wrap items-center justify-between gap-4">
    <div>
      <div class="flex flex-wrap mb-2 items-center">
        <h3 class="text-lg font-extrabold mr-2">이메일 인증</h3>
        <Badge class="text-xs font-bold" color="green">인증 완료</Badge>
      </div>
      <p class="text-3.75 text-secondary break-keep">펜슬의 콘텐츠를 이용하려면 이메일 인증이 필요해요</p>
    </div>

    <Button color="tertiary" size="md" variant="outlined" on:click={() => (updateEmailOpen = true)}>변경하기</Button>
  </div>

  <div class="flex flex-wrap items-center justify-between gap-4">
    <div>
      <div class="flex flex-wrap mb-2 items-center">
        <h3 class="text-lg font-extrabold mr-2">본인 인증</h3>
        <Badge class="text-xs font-bold mr-2" color="red">인증 필요</Badge>
        <Badge class="text-xs font-bold" color="gray">만료됨</Badge>
      </div>
      <p class="text-3.75 text-secondary break-keep">펜슬의 콘텐츠를 이용하려면 본인 인증이 필요해요</p>
    </div>
    <Button color="secondary" size="md">인증하기</Button>
  </div>

  <div class="w-full border-b border-alphagray-15" />

  <h3 class="text-lg font-extrabold mb-4">연동 관리</h3>

  <UserSingleSignOn $user={$query.me} provider="GOOGLE" />
  <UserSingleSignOn $user={$query.me} provider="NAVER" />

  <div class="w-full border-b border-alphagray-15" />

  <div class="flex flex-wrap items-center justify-between gap-4">
    <div>
      <h3 class="text-lg font-extrabold mb-2">마케팅 수신 동의</h3>
      {#if $query.me.marketingConsent}
        <p class="text-3.75 text-secondary break-keep">
          {dayjs($query.me.marketingConsent.createdAt).formatAsDate()} 승인됨
        </p>
      {/if}
    </div>
    <Switch
      checked={!!$query.me.marketingConsent}
      on:change={async () => {
        const consent = !$query.me.marketingConsent;
        await updateUserMarketingConsent({ consent });
        toast.success(`${dayjs().formatAsDate()} ${consent ? '승인' : '거부'} 처리되었어요`, {
          title: '펜슬 마케팅 수신 동의',
        });
      }}
    />
  </div>

  <div class="w-full border-b border-alphagray-15" />

  <!-- <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h3 class="text-lg font-extrabold mb-2">2차 인증</h3>
        <p class="text-3.75 text-secondary break-keep">2차 인증을 통해 계정을 더욱 안전하게 관리하세요</p>
      </div>
      <Button color="secondary" size="md">인증하기</Button>
    </div>
  
    <div class="w-full border-b border-alphagray-15" /> -->

  <div class="flex justify-end">
    <Button href="/me/settings/deactivate" size="lg" type="link" variant="text">
      탈퇴하기
      <span class="i-lc-chevron-right" />
    </Button>
  </div>
</div>

<UpdateEmailModal bind:open={updateEmailOpen} />
<UpdateProfileModal $profile={$query.me.profile} bind:open={updateProfileOpen} />
