<script lang="ts">
  import IconMail from '~icons/tabler/mail';
  import IconUserSearch from '~icons/tabler/user-search';
  import Google from '$assets/icons/google.svg?component';
  import Naver from '$assets/icons/naver.svg?component';
  import FullLogo from '$assets/logos/full.svg?component';
  import { graphql } from '$glitch';
  import { analytics } from '$lib/analytics';
  import { Helmet, Icon, Image } from '$lib/components';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';

  $: query = graphql(`
    query LoginPage_Query {
      featuredImage {
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
  {#if $query.featuredImage}
    <Image
      style={css.raw({ flexGrow: '1', objectFit: 'cover', overflow: 'hidden' })}
      $image={$query.featuredImage}
      size="full"
    />
  {:else}
    <div class={css({ flexGrow: '1', backgroundColor: 'gray.100' })} />
  {/if}

  <div
    class={flex({
      direction: 'column',
      justifyContent: 'center',
      paddingX: { base: '20px', sm: '60px' },
      width: 'full',
      backgroundColor: { base: '[black/40]', sm: 'gray.0' },
      sm: { flex: 'none', width: '520px' },
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
        <FullLogo class={css({ height: { base: '38px', sm: '17px' }, smDown: { color: 'gray.0' } })} />
      </a>

      <h1
        class={css({ marginTop: '20px', marginBottom: '4px', fontSize: '24px', fontWeight: 'bold', hideBelow: 'sm' })}
      >
        로그인/회원가입
      </h1>

      <p
        class={css({
          fontSize: '16px',
          color: 'gray.500',
          smDown: { textAlign: 'center', color: 'gray.0' },
        })}
      >
        창작자를 위한 콘텐츠 플랫폼
        <br class={css({ hideFrom: 'sm' })} />
        글리프에 오신 것을 환영해요!
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
          backgroundColor: 'gray.0',
          height: '48px',
          _hover: { backgroundColor: 'gray.50' },
          sm: { borderWidth: '1px', borderColor: 'gray.150' },
        })}
        type="button"
        on:click={async () => {
          const { url } = await issueUserSingleSignOnAuthorizationUrl({
            type: 'LOGIN',
            provider: 'GOOGLE',
          });

          analytics.track('user:login:start', { method: 'google' });
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
          backgroundColor: 'gray.0',
          height: '48px',
          _hover: { backgroundColor: 'gray.50' },
          sm: { borderWidth: '1px', borderColor: 'gray.150' },
        })}
        type="button"
        on:click={async () => {
          const { url } = await issueUserSingleSignOnAuthorizationUrl({
            type: 'LOGIN',
            provider: 'NAVER',
          });

          analytics.track('user:login:start', { method: 'naver' });
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
          backgroundColor: 'gray.0',
          height: '48px',
          _hover: { backgroundColor: 'gray.50' },
          sm: { borderWidth: '1px', borderColor: 'gray.150' },
        })}
        href="/login/email"
      >
        <Icon icon={IconMail} size={20} />
        이메일로 시작하기
      </a>

      <a
        class={flex({
          align: 'center',
          justify: { base: 'center', sm: 'flex-start' },
          gap: '8px',
          paddingX: '20px',
          sm: {
            borderWidth: '1px',
            borderColor: 'gray.150',
            backgroundColor: 'gray.0',
            color: 'gray.500',
            textAlign: 'left',
            height: '48px',
            _hover: { backgroundColor: 'gray.50' },
          },
          smDown: {
            marginTop: '5px',
            color: 'gray.100',
            fontWeight: 'semibold',
            textAlign: 'center',
          },
        })}
        href="/find-account"
      >
        <Icon style={css.raw({ color: 'gray.400', hideBelow: 'sm' })} icon={IconUserSearch} size={20} />
        계정 찾기
      </a>
    </div>
  </div>
</div>
