<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import dayjs from 'dayjs';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import Google from '$assets/icons/google.svg?component';
  import Naver from '$assets/icons/naver.svg?component';
  import { graphql } from '$glitch';
  import { Avatar, Badge, Button } from '$lib/components';
  import { Switch } from '$lib/components/forms';
  import { toast } from '$lib/notification';
  import UpdateEmailModal from './UpdateEmailModal.svelte';
  import UpdatePasswordModal from './UpdatePasswordModal.svelte';
  import UpdateProfileModal from './UpdateProfileModal.svelte';

  let updateEmailOpen = false;
  let updateProfileOpen = false;
  let updatePasswordOpen = false;

  $: query = graphql(`
    query MeAccountsPage_Query {
      me @_required {
        id
        email
        state

        marketingConsent {
          id
          createdAt
        }

        google: singleSignOn(provider: GOOGLE) {
          id
          providerEmail
        }

        naver: singleSignOn(provider: NAVER) {
          id
          providerEmail
        }

        profile {
          id
          name

          ...Avatar_profile
          ...MeAccountsPage_UpdateProfileModal_profile
        }

        ...MeAccountsPage_UpdatePasswordModal_user
      }
    }
  `);

  const issueUserSingleSignOnAuthorizationUrl = graphql(`
    mutation MeAccountsPage_IssueUserSingleSignOnAuthorizationUrl_Mutation(
      $input: IssueUserSingleSignOnAuthorizationUrlInput!
    ) {
      issueUserSingleSignOnAuthorizationUrl(input: $input) {
        url
      }
    }
  `);

  const updateUserMarketingConsent = graphql(`
    mutation MeAccountsPage_UpdateUserMarketingConsent_Mutation($input: UpdateUserMarketingConsentInput!) {
      updateUserMarketingConsent(input: $input) {
        id

        marketingConsent {
          id
          createdAt
        }
      }
    }
  `);

  const unlinkUserSingleSignOn = graphql(`
    mutation MeAccountsPage_UnlinkUserSingleSignOn_Mutation($input: UnlinkUserSingleSignOnInput!) {
      unlinkUserSingleSignOn(input: $input) {
        id

        google: singleSignOn(provider: GOOGLE) {
          id
        }

        naver: singleSignOn(provider: NAVER) {
          id
        }
      }
    }
  `);

  const resendUserActivationEmail = graphql(`
    mutation MeAccountsPage_ResendUserActivationEmail_Mutation {
      resendUserActivationEmail
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

<h2 class="text-xl font-bold mb-6 <sm:hidden">계정 설정</h2>
<div class="bg-white py-8 px-6 space-y-8 text-3.75 sm:(px-8 border border-gray-30 rounded-2xl)">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <Avatar class="square-12.5" $profile={$query.me.profile} />
      <div class="flex flex-col flex-wrap">
        <span class="text-lg font-extrabold mr-2">
          {$query.me.profile.name}
        </span>
        <span class="text-3.75 text-gray-50">{$query.me.email}</span>
      </div>
    </div>
    <Button color="secondary" size="md" on:click={() => (updateProfileOpen = true)}>프로필 수정</Button>
  </div>

  <div class="flex flex-wrap items-center justify-between gap-4">
    <div>
      <div class="flex flex-wrap mb-2 items-center">
        <h3 class="text-lg font-extrabold mr-2">이메일 인증</h3>
        {#if $query.me.state === 'PROVISIONAL'}
          <Badge class="text-xs font-bold" color="red">인증 필요</Badge>
        {:else}
          <Badge class="text-xs font-bold" color="green">인증 완료</Badge>
        {/if}
      </div>
      <p class="text-3.75 text-gray-50 break-keep">펜슬의 콘텐츠를 이용하려면 이메일 인증이 필요해요</p>
    </div>
    <div class="flex gap-2">
      <Button color="tertiary" size="md" variant="outlined" on:click={() => (updateEmailOpen = true)}>변경하기</Button>

      {#if $query.me.state === 'PROVISIONAL'}
        <Button
          color="secondary"
          size="md"
          on:click={async () => {
            try {
              await resendUserActivationEmail();
              toast.success('이메일 인증 메일을 보냈어요');
            } catch {
              toast.error('이메일 인증 메일을 보내는 중 오류가 발생했어요');
            }
          }}
        >
          인증하기
        </Button>
      {/if}
    </div>
  </div>

  <div class="flex flex-wrap items-center justify-between gap-4">
    <div>
      <div class="flex flex-wrap mb-2 items-center">
        <h3 class="text-lg font-extrabold mr-2">본인 인증</h3>
        <Badge class="text-xs font-bold mr-2" color="red">인증 필요</Badge>
        <Badge class="text-xs font-bold" color="gray">만료됨</Badge>
      </div>
      <p class="text-3.75 text-gray-50 break-keep">펜슬의 콘텐츠를 이용하려면 본인 인증이 필요해요</p>
    </div>
    <Button color="secondary" size="md">인증하기</Button>
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
        {#if $query.me.google}
          <p class="text-3.75 text-gray-50 break-keep">
            {$query.me.google.providerEmail}
          </p>
        {/if}
      </div>
    </div>
    {#if $query.me.google}
      <Button
        color="tertiary"
        size="md"
        variant="outlined"
        on:click={async () => {
          await unlinkUserSingleSignOn({
            provider: 'GOOGLE',
          });
        }}
      >
        연동 해제
      </Button>
    {:else}
      <Button
        color="secondary"
        size="md"
        on:click={async () => {
          const { url } = await issueUserSingleSignOnAuthorizationUrl({
            type: 'LINK',
            provider: 'GOOGLE',
          });

          location.href = url;
        }}
      >
        연동하기
      </Button>
    {/if}
  </div>

  <div class="flex flex-wrap items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="square-9 flex center">
        <Naver class="square-7.5" />
      </div>
      <div>
        <h3 class="text-lg font-extrabold mr-2">Naver</h3>
        {#if $query.me.naver}
          <p class="text-3.75 text-gray-50 break-keep">
            {$query.me.naver.providerEmail}
          </p>
        {/if}
      </div>
    </div>
    {#if $query.me.naver}
      <Button
        color="tertiary"
        size="md"
        variant="outlined"
        on:click={async () => {
          await unlinkUserSingleSignOn({
            provider: 'NAVER',
          });
        }}
      >
        연동 해제
      </Button>
    {:else}
      <Button
        color="secondary"
        size="md"
        on:click={async () => {
          const { url } = await issueUserSingleSignOnAuthorizationUrl({
            type: 'LINK',
            provider: 'NAVER',
          });

          location.href = url;
        }}
      >
        연동하기
      </Button>
    {/if}
  </div>

  <div class="w-full border-b border-alphagray-15" />

  <div class="flex flex-wrap items-center justify-between gap-4">
    <div>
      <h3 class="text-lg font-extrabold mb-2">마케팅 수신 동의</h3>
      {#if $query.me.marketingConsent}
        <p class="text-3.75 text-gray-50 break-keep">
          {dayjs($query.me.marketingConsent.createdAt).formatAsDate()} 승인됨
        </p>
      {/if}
    </div>
    <Switch
      checked={!!$query.me.marketingConsent}
      on:change={async () => {
        const consent = !$query.me.marketingConsent;
        await updateUserMarketingConsent({ consent });
        toast.success(`펜슬의 마케팅 수신 동의가 ${dayjs().formatAsDate()} ${consent ? '승인' : '거부'} 처리되었어요`);
      }}
    />
  </div>

  <div class="w-full border-b border-alphagray-15" />

  <div class="flex flex-wrap items-center justify-between gap-4">
    <div>
      <h3 class="text-lg font-extrabold mb-2">비밀번호</h3>
      <p class="text-3.75 text-gray-50 break-keep">비밀번호를 변경하세요</p>
    </div>
    <Button color="secondary" size="md" on:click={() => (updatePasswordOpen = true)}>변경하기</Button>
  </div>

  <div class="flex flex-wrap items-center justify-between gap-4">
    <div>
      <h3 class="text-lg font-extrabold mb-2">2차 인증</h3>
      <p class="text-3.75 text-gray-50 break-keep">2차 인증을 통해 계정을 더욱 안전하게 관리하세요</p>
    </div>
    <Button color="secondary" size="md">인증하기</Button>
  </div>

  <div class="w-full border-b border-alphagray-15" />

  <div class="flex justify-end">
    <Button href="/me/accounts/deactivate" size="lg" type="link" variant="text">
      탈퇴하기
      <span class="i-lc-chevron-right" />
    </Button>
  </div>
</div>

<UpdateEmailModal bind:open={updateEmailOpen} />
<UpdatePasswordModal $user={$query.me} bind:open={updatePasswordOpen} />
<UpdateProfileModal $profile={$query.me.profile} bind:open={updateProfileOpen} />
