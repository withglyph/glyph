<script lang="ts">
  import IconMail from '~icons/tabler/mail';
  import Google from '$assets/icons/google.svg?component';
  import Naver from '$assets/icons/naver.svg?component';
  import FullLogo from '$assets/logos/full.svg?component';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Helmet, Icon, Image } from '$lib/components';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';

  $: query = graphql(`
    query LoginPage_Query {
      authLayoutBackgroundImage {
        id
        ...Image_image
      }
    }
  `);

  const issueUserSingleSignOnAuthorizationUrl = graphql(`
    mutation LoginPage_IssueUserSingleSignOnAuthorizationUrl_Mutation(
      $input: IssueUserSingleSignOnAuthorizationUrlInput!
    ) {
      issueUserSingleSignOnAuthorizationUrl(input: $input) {
        url
      }
    }
  `);
</script>

<Helmet description="이메일을 통해 글리프에 가입하거나 로그인할 수 있어요" title="글리프 시작하기" />

<div class={css({ position: 'fixed', inset: '0', display: 'flex' })}>
  {#if $query.authLayoutBackgroundImage}
    <Image style={css.raw({ flexGrow: '1', objectFit: 'cover' })} $image={$query.authLayoutBackgroundImage} />
  {:else}
    <div class={css({ flexGrow: '1', backgroundColor: 'gray.100' })} />
  {/if}

  <div
    class={flex({
      direction: 'column',
      justifyContent: 'center',
      paddingX: { base: '20px', sm: '43px' },
      width: 'full',
      backgroundColor: { base: '[black/40]', sm: 'gray.5' },
      sm: { width: '420px' },
      smDown: { position: 'fixed', zIndex: '1', size: 'full' },
    })}
  >
    <div
      class={center({
        flexDirection: 'column',
        alignItems: { base: 'center', sm: 'flex-start' },
        smDown: { flexGrow: '1' },
      })}
    >
      <a href="/">
        <FullLogo class={css({ width: 'fit', height: { base: '38px', sm: '17px' }, smDown: { color: 'gray.5' } })} />
      </a>

      <h1
        class={css({ marginTop: '20px', marginBottom: '4px', fontSize: '24px', fontWeight: 'bold', hideBelow: 'sm' })}
      >
        로그인/회원가입
      </h1>

      <p
        class={css({
          fontSize: '14px',
          color: 'gray.500',
          smDown: { fontWeight: 'medium', textAlign: 'center', color: 'gray.5' },
        })}
      >
        나만의 공간, 함께 새겨질 우주
        <br />
        창작자를 위한 플랫폼 글리프와 함께하세요
      </p>
    </div>

    <div
      class={flex({
        direction: 'column',
        gap: '11px',
        marginTop: { base: '32px', sm: '24px' },
        marginBottom: { base: '60px' },
      })}
    >
      <button
        class={flex({
          align: 'center',
          justify: { base: 'center', sm: 'flex-start' },
          gap: '10px',
          paddingX: '20px',
          fontSize: '16px',
          textAlign: 'left',
          backgroundColor: 'gray.5',
          height: '48px',
          sm: { borderWidth: '1px', borderColor: 'gray.150' },
        })}
        type="button"
        on:click={async () => {
          const { url } = await issueUserSingleSignOnAuthorizationUrl({
            type: 'LOGIN',
            provider: 'GOOGLE',
          });

          mixpanel.track('user:login:start', { method: 'google' });
          location.href = url;
        }}
      >
        <Icon style={css.raw({ size: '18px' })} icon={Google} />
        구글로 시작하기
      </button>

      <button
        class={flex({
          align: 'center',
          justify: { base: 'center', sm: 'flex-start' },
          gap: '10px',
          paddingX: '20px',
          fontSize: '16px',
          textAlign: 'left',
          backgroundColor: 'gray.5',
          height: '48px',
          sm: { borderWidth: '1px', borderColor: 'gray.150' },
        })}
        type="button"
        on:click={async () => {
          const { url } = await issueUserSingleSignOnAuthorizationUrl({
            type: 'LOGIN',
            provider: 'NAVER',
          });

          mixpanel.track('user:login:start', { method: 'naver' });
          location.href = url;
        }}
      >
        <Icon icon={Naver} />
        네이버로 시작하기
      </button>

      <a
        class={flex({
          align: 'center',
          justify: { base: 'center', sm: 'flex-start' },
          gap: '8px',
          paddingX: '20px',
          fontSize: '16px',
          textAlign: 'left',
          backgroundColor: 'gray.5',
          height: '48px',
          sm: { borderWidth: '1px', borderColor: 'gray.150' },
        })}
        href="/login/email"
      >
        <Icon icon={IconMail} size={20} />
        이메일로 시작하기
      </a>
    </div>
  </div>
</div>
