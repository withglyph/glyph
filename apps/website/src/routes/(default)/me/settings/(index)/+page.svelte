<script lang="ts">
  import dayjs from 'dayjs';
  import { nanoid } from 'nanoid';
  import qs from 'query-string';
  import { onMount } from 'svelte';
  import IconDeviceMobile from '~icons/tabler/device-mobile';
  import IconEPassport from '~icons/tabler/e-passport';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Alert, Avatar, Chip, Helmet, Icon } from '$lib/components';
  import { Switch } from '$lib/components/forms';
  import { Button, Modal } from '$lib/components/v2';
  import { Table, TableBody, TableData, TableHead, TableHeader, TableRow } from '$lib/components/v2/table';
  import { toast } from '$lib/notification';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import UpdateEmailModal from './UpdateEmailModal.svelte';
  import UpdateProfileModal from './UpdateProfileModal.svelte';
  import UserSingleSignOn from './UserSingleSignOn.svelte';
  import VerifyPassportIdentityModal from './VerifyPassportIdentityModal.svelte';

  let updateEmailOpen = false;
  let updateProfileOpen = false;
  let verifyPassportIdentityOpen = false;
  let marketingConsentOpen = false;
  let userVerifyOpen = false;

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
          name
          createdAt
        }

        profile {
          id
          name

          ...Avatar_profile
          ...MeSettingsPage_UpdateProfileModal_profile
        }

        ...MeSettingsPage_UpdateEmailModal_user
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

    // @ts-expect-error portone 관련 코드
    IMP.init('imp72534540');

    // @ts-expect-error portone 관련 코드
    IMP.certification(
      {
        merchant_uid: nanoid(),
        company: 'Glyph',
        m_redirect_url: `${$page.url.origin}/api/identification/callback`,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (resp: any) => {
        if (resp.error_msg) {
          toast(resp.error_msg);
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
        toast('이 소셜 계정은 이미 다른 글리프 계정에 연동되어 있어요.');
        break;
    }
  });
</script>

<svelte:head>
  <script src="https://cdn.iamport.kr/v1/iamport.js">
  </script>
</svelte:head>

<Helmet description="내 계정을 설정해요" title="계정 설정" />

<h2 class={css({ marginBottom: '4px', fontSize: { base: '16px', sm: '18px' }, fontWeight: 'semibold' })}>
  기본 프로필
</h2>

<p class={css({ fontSize: '13px', color: 'gray.500' })}>
  해당 프로필은 자신에게만 보여지는 기본 프로필이며,
  <br />
  스페이스 관리에서 스페이스별로 프로필을 개별 설정할 수 있어요.
</p>

<div
  class={flex({
    align: 'center',
    justify: 'space-between',
    gap: '20px',
    marginTop: '20px',
    width: 'full',
    maxWidth: '450px',
  })}
>
  <div class={flex({ align: 'center', gap: '6px', truncate: true })}>
    <Avatar
      style={css.raw({ borderWidth: '[0.8px]', borderColor: 'gray.150', size: '40px' })}
      $profile={$query.me.profile}
      size={48}
    />
    <p class={css({ truncate: true })}>{$query.me.profile.name}</p>
  </div>

  <Button
    style={css.raw({ flex: 'none' })}
    size="sm"
    variant="gray-sub-fill"
    on:click={() => (updateProfileOpen = true)}
  >
    프로필 수정
  </Button>
</div>

<hr class={css({ marginY: { base: '28px', sm: '48px' }, border: 'none', backgroundColor: 'gray.50', height: '1px' })} />

<h2 class={css({ fontSize: { base: '16px', sm: '18px' }, fontWeight: 'semibold' })}>이메일 주소 변경</h2>

<div
  class={flex({
    align: 'center',
    justify: 'space-between',
    gap: '6px',
    marginTop: '12px',
    marginBottom: '26px',
    width: 'full',
    maxWidth: '450px',
  })}
>
  <div
    class={css({
      flexGrow: '1',
      paddingX: '12px',
      paddingY: '10px',
      fontSize: '14px',
      fontWeight: 'medium',
      color: 'gray.400',
      backgroundColor: 'gray.50',
      height: '40px',
    })}
  >
    {$query.me.email}
  </div>
  <Button
    style={css.raw({ flex: 'none', height: '40px' })}
    size="sm"
    variant="gray-sub-fill"
    on:click={() => (updateEmailOpen = true)}
  >
    이메일 변경
  </Button>
</div>

<hr class={css({ marginY: { base: '28px', sm: '48px' }, border: 'none', backgroundColor: 'gray.50', height: '1px' })} />

<h2 class={css({ marginBottom: '4px', fontSize: { base: '16px', sm: '18px' }, fontWeight: 'semibold' })}>본인인증</h2>

<p class={css({ fontSize: '13px', color: 'gray.500' })}>
  - 본인인증은 1개의 계정에만 가능하며, 인증 완료일로부터 1년간 유효해요.
  <br />
  - 계정을 분실한 경우, 본인인증을 통해 계정을 찾을 수 있어요.
  <br />
  - 성인물 등 특정 콘텐츠를 이용하려면 본인인증이 필요해요.
</p>

<div class={css({ width: 'full', maxWidth: '450px' })}>
  <Table style={css.raw({ marginTop: '20px' })}>
    <TableHeader>
      <TableRow style={css.raw({ textAlign: 'left' })}>
        <TableHead>이름</TableHead>
        <TableHead>본인인증 여부</TableHead>
        <TableHead>본인인증 유효기간</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableData>{$query.me.personalIdentity?.name ?? ''}</TableData>
        <TableData>
          <!-- TODO: 기간 만료된 경우 -->
          <Chip style={css.raw({ width: 'fit' })} color={$query.me.personalIdentity ? 'grass' : 'red'} variant="fill">
            {$query.me.personalIdentity ? '인증완료' : '미인증'}
          </Chip>
        </TableData>
        <!-- TODO: 만료 기간 표시 -->
        <TableData>2024.04.22</TableData>
      </TableRow>
    </TableBody>
  </Table>

  <!-- TODO: 기간 만료된 경우 -->
  {#if !$query.me.personalIdentity || false}
    <Button
      style={css.raw({ marginTop: '8px', width: 'full', height: '40px' })}
      size="sm"
      variant="brand-fill"
      on:click={() => (userVerifyOpen = true)}
    >
      본인인증하기
    </Button>
  {/if}
</div>

<hr class={css({ marginY: { base: '28px', sm: '48px' }, border: 'none', backgroundColor: 'gray.50', height: '1px' })} />

<h2 class={css({ marginBottom: '4px', fontSize: { base: '16px', sm: '18px' }, fontWeight: 'semibold' })}>
  SNS 연동관리
</h2>

<div class={flex({ direction: 'column', gap: '32px', marginTop: '20px', width: 'full', maxWidth: '450px' })}>
  <UserSingleSignOn $user={$query.me} provider="GOOGLE" />
  <UserSingleSignOn $user={$query.me} provider="NAVER" />
  <UserSingleSignOn $user={$query.me} provider="TWITTER" />
</div>

<hr class={css({ marginY: { base: '28px', sm: '48px' }, border: 'none', backgroundColor: 'gray.50', height: '1px' })} />

<div class={flex({ align: 'center', justify: 'space-between', width: 'full', maxWidth: '450px' })}>
  <div>
    <h2 class={css({ marginBottom: '4px', fontSize: { base: '16px', sm: '18px' }, fontWeight: 'semibold' })}>
      이벤트 및 글리프 소식 받아보기
    </h2>

    {#if $query.me.marketingConsent}
      <p class={css({ fontSize: '13px', color: 'gray.500' })}>
        {dayjs($query.me.marketingConsent.createdAt).formatAsDate()} 수신동의
      </p>
    {/if}
  </div>

  <Switch
    checked={!!$query.me.marketingConsent}
    on:change={async () => {
      const consent = !$query.me.marketingConsent;
      await updateUserMarketingConsent({ consent });
      mixpanel.track('user:marketing_consent:update', { consent });
      marketingConsentOpen = true;
    }}
  />
</div>

<hr
  class={css({
    marginTop: { base: '28px', sm: '48px' },
    marginBottom: '20px',
    border: 'none',
    backgroundColor: 'gray.50',
    height: '1px',
  })}
/>

<a class={css({ fontWeight: 'medium', color: 'gray.400' })} href="/me/settings/deactivate">탈퇴하기</a>

<Alert actionStyle={css.raw({ gridTemplateColumns: '1' })} bind:open={marketingConsentOpen}>
  <p slot="title" class={css({ textAlign: 'left' })}>글리프 마케팅 수신 동의</p>

  <p slot="content" class={css({ textAlign: 'left' })}>
    {dayjs().formatAsDate()}
    {$query.me.marketingConsent ? '동의' : '거부'}처리되었어요
  </p>

  <svelte:fragment slot="action">
    <Button size="lg" on:click={() => (marketingConsentOpen = false)}>확인</Button>
  </svelte:fragment>
</Alert>

<Modal style={css.raw({ paddingBottom: '96px' })} bind:open={userVerifyOpen}>
  <svelte:fragment slot="title">본인인증</svelte:fragment>

  <p class={css({ fontWeight: 'medium' })}>본인인증 진행</p>
  <p class={css({ marginTop: '6px', marginBottom: '20px', fontSize: '13px', color: 'gray.500' })}>
    본인인증은 1개의 계정에만 가능하며, 인증 완료일로부터 1년간 유효해요.
  </p>

  <Button
    style={flex.raw({
      align: 'center',
      gap: '10px',
      marginBottom: '12px',
      paddingX: '20px',
      fontSize: '16px',
      width: 'full',
    })}
    size="md"
    variant="gray-outline"
    on:click={() => {
      userVerifyOpen = false;
      handleUserIdentityVerification();
    }}
  >
    <Icon style={css.raw({ color: 'gray.500' })} icon={IconDeviceMobile} size={20} />
    휴대폰 인증
  </Button>
  <Button
    style={flex.raw({ align: 'center', gap: '10px', paddingX: '20px', fontSize: '16px', width: 'full' })}
    size="md"
    variant="gray-outline"
    on:click={() => {
      userVerifyOpen = false;
      verifyPassportIdentityOpen = true;
    }}
  >
    <Icon style={css.raw({ color: 'gray.500' })} icon={IconEPassport} size={20} />
    여권 인증
  </Button>
</Modal>

<UpdateEmailModal $user={$query.me} bind:open={updateEmailOpen} />
<UpdateProfileModal $profile={$query.me.profile} bind:open={updateProfileOpen} />
<VerifyPassportIdentityModal bind:open={verifyPassportIdentityOpen} />
