<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import dayjs from 'dayjs';
  import { nanoid } from 'nanoid';
  import qs from 'query-string';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
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

        personalIdentity {
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

  const handleUserIdentityVerification = () => {
    mixpanel.track('user:personal-identity-verification:start');

    // @ts-expect-error portone
    IMP.init('imp72534540');

    // @ts-expect-error portone
    IMP.certification(
      {
        merchant_uid: nanoid(),
        company: 'PENXLE',
        m_redirect_url: `${$page.url.origin}/api/identification/callback`,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (resp: any) => {
        if (resp.error_msg) {
          toast.error(resp.error_msg);
          return;
        }

        location.href = qs.stringifyUrl({
          url: '/api/identification/callback',
          query: { imp_uid: resp.imp_uid },
        });
      },
    );
  };

  onMount(() => {
    switch ($page.url.searchParams.get('message')) {
      case 'sso_already_linked_by_other':
        toast.error('이 소셜 계정은 이미 다른 펜슬 계정에 연동되어 있어요.');
        break;
    }
  });
</script>

<svelte:head>
  <script src="https://cdn.iamport.kr/v1/iamport.js">
  </script>
</svelte:head>

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
    </div>

    <Button color="tertiary" size="md" variant="outlined" on:click={() => (updateEmailOpen = true)}>변경하기</Button>
  </div>

  <div class="flex flex-wrap items-center justify-between gap-4">
    <div>
      <div class="flex flex-wrap mb-2 items-center">
        <h3 class="text-lg font-extrabold mr-2">본인 인증</h3>
        {#if $query.me.personalIdentity}
          <Badge class="text-xs font-bold" color="green">인증 완료</Badge>
        {:else}
          <Badge class="text-xs font-bold" color="red">인증 필요</Badge>
        {/if}
        <!-- <Badge class="text-xs font-bold ml-2" color="gray">만료됨</Badge> -->
      </div>
      <p class="text-3.75 text-secondary break-keep">
        {#if $query.me.personalIdentity}
          {dayjs($query.me.personalIdentity.createdAt).formatAsDate()} 에 인증을 진행했어요
        {:else}
          성인물 등 특정 콘텐츠를 이용하려면 본인 인증이 필요해요
        {/if}
      </p>
    </div>
    {#if !$query.me.personalIdentity}
      <Button color="secondary" size="md" on:click={handleUserIdentityVerification}>인증하기</Button>
    {/if}
  </div>

  <div class="w-full border-b border-alphagray-15" />

  <h3 class="text-lg font-extrabold mb-4">연동 관리</h3>

  <UserSingleSignOn $user={$query.me} provider="GOOGLE" />
  <UserSingleSignOn $user={$query.me} provider="NAVER" />

  <div class="w-full border-b border-alphagray-15" />

  <div class="flex flex-wrap items-center justify-between gap-4">
    <div>
      <h3 class="text-lg font-extrabold mb-2">이벤트 등 펜슬 소식 받아보기</h3>
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
        mixpanel.track('user:marketing_consent:update', { consent });
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
      <i class="i-lc-chevron-right" />
    </Button>
  </div>
</div>

<UpdateEmailModal bind:open={updateEmailOpen} />
<UpdateProfileModal $profile={$query.me.profile} bind:open={updateProfileOpen} />
