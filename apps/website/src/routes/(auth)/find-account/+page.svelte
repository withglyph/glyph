<script lang="ts">
  import { nanoid } from 'nanoid';
  import qs from 'query-string';
  import IconDeviceMobile from '~icons/tabler/device-mobile';
  import { page } from '$app/stores';
  import { mixpanel } from '$lib/analytics';
  import { Alert, Helmet, Icon, Link } from '$lib/components';
  import { Button } from '$lib/components/v2';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

  let accountNotFoundOpen = false;

  const handleUserIdentityVerification = () => {
    mixpanel.track('user:personal-identity-verification:start');

    // @ts-expect-error portone 관련 코드
    IMP.init('imp72534540');

    // @ts-expect-error portone 관련 코드
    IMP.certification(
      {
        merchant_uid: nanoid(),
        company: 'Glyph',
        m_redirect_url: `${$page.url.origin}/api/identification/callback?action=find_account`,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (resp: any) => {
        if (resp.error_msg) {
          accountNotFoundOpen = true;
          return;
        }

        location.href = qs.stringifyUrl({
          url: '/api/identification/callback',
          query: { imp_uid: resp.imp_uid, action: 'find_account' },
        });
      },
    );
  };
</script>

<svelte:head>
  <script src="https://cdn.iamport.kr/v1/iamport.js">
  </script>
</svelte:head>

<Helmet description="휴대폰 본인인증을 통해 글리프 계정을 찾을 수 있어요" title="글리프 계정 찾기" />

<h1 class={css({ marginTop: { base: '32px', sm: '20px' }, marginBottom: '4px', fontSize: '24px', fontWeight: 'bold' })}>
  계정찾기
</h1>

<h2 class={css({ fontSize: '14px', color: 'gray.500' })}>휴대폰 본인인증을 통해 계정을 찾을 수 있어요</h2>

<button
  class={flex({
    align: 'center',
    justify: 'flex-start',
    gap: '8px',
    borderWidth: '1px',
    borderColor: 'gray.150',
    marginTop: '36px',
    paddingX: '20px',
    textAlign: 'left',
    fontWeight: 'semibold',
    backgroundColor: 'gray.5',
    height: '48px',
    _hover: { backgroundColor: 'gray.50' },
  })}
  type="button"
  on:click={handleUserIdentityVerification}
>
  <Icon style={css.raw({ color: 'gray.500' })} icon={IconDeviceMobile} size={24} />
  휴대전화로 계정 찾기
</button>

<div class={css({ marginTop: 'auto', marginBottom: '32px', fontSize: '14px', color: 'gray.500' })}>
  <span>위 방법으로 계정을 찾을 수 없나요?</span>
  <Link style={css.raw({ textDecoration: 'underline' })} href="https://penxle.channel.io/home">문의하기</Link>
</div>

<Alert containerStyle={css.raw({ sm: { maxWidth: '460px' } })} bind:open={accountNotFoundOpen}>
  <svelte:fragment slot="title">가입되지 않았어요</svelte:fragment>

  <svelte:fragment slot="action">
    <Button
      style={css.raw({ hideFrom: 'sm' })}
      size="lg"
      variant="gray-sub-fill"
      on:click={() => (accountNotFoundOpen = false)}
    >
      닫기
    </Button>
    <Button
      style={css.raw({ hideBelow: 'sm' })}
      size="lg"
      variant="gray-outline"
      on:click={() => (accountNotFoundOpen = false)}
    >
      닫기
    </Button>
    <Button href="/login" size="lg" type="link">회원가입</Button>
  </svelte:fragment>
</Alert>
