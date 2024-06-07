<script lang="ts">
  import * as R from 'radash';
  import Google from '$assets/icons/google.svg?component';
  import Naver from '$assets/icons/naver.svg?component';
  import Twitter from '$assets/icons/twitter.svg?component';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Alert } from '$lib/components';
  import { Button } from '$lib/components/v2';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import type { MeSettingsPage_UserSingleSignOn_user, UserSingleSignOnProvider } from '$glitch';

  let _user: MeSettingsPage_UserSingleSignOn_user;
  export { _user as $user };

  export let provider: UserSingleSignOnProvider;
  let open = false;
  let providerName = {
    APPLE: '애플',
    GOOGLE: '구글',
    NAVER: '네이버',
    TWITTER: '트위터',
  }[provider];

  $: user = fragment(
    _user,
    graphql(`
      fragment MeSettingsPage_UserSingleSignOn_user on User {
        id

        singleSignOns {
          id
          provider
          email
        }

        eventEnrollment(eventCode: "twitter_spacelink_2024") {
          id
          eligible
        }
      }
    `),
  );

  const issueUserSingleSignOnAuthorizationUrl = graphql(`
    mutation MeSettingsPage_UserSingleSignOn_IssueUserSingleSignOnAuthorizationUrl_Mutation(
      $input: IssueUserSingleSignOnAuthorizationUrlInput!
    ) {
      issueUserSingleSignOnAuthorizationUrl(input: $input) {
        url
      }
    }
  `);

  const unlinkUserSingleSignOn = graphql(`
    mutation MeSettingsPage_UserSingleSignOn_UnlinkUserSingleSignOn_Mutation($input: UnlinkUserSingleSignOnInput!) {
      unlinkUserSingleSignOn(input: $input) {
        id

        singleSignOns {
          id
          provider
          email
        }
      }
    }
  `);

  $: singleSignOns = R.objectify($user.singleSignOns, (v) => v.provider);
</script>

<div class={flex({ align: 'center', gap: '16px' })}>
  <div class={center({ size: '38px' })}>
    {#if provider === 'GOOGLE'}
      <Google class={css({ size: '38px' })} />
    {:else if provider === 'NAVER'}
      <Naver class={css({ size: '38px' })} />
    {:else if provider === 'TWITTER'}
      <Twitter class={css({ size: '38px' })} />
    {/if}
  </div>
  <div class={css({ flexGrow: '1', truncate: true })}>
    <h3 class={css({ marginRight: '8px', fontSize: '15px', fontWeight: 'medium' })}>{R.capitalize(provider)}</h3>
    {#if singleSignOns[provider]}
      <p class={css({ fontSize: '13px', color: 'gray.600', wordBreak: 'keep-all', truncate: true })}>
        {singleSignOns[provider].email}
        {#if provider === 'TWITTER' && $user.eventEnrollment?.eligible}
          <span>| 링크확인됨</span>
        {/if}
      </p>
    {/if}
  </div>
  {#if singleSignOns[provider]}
    <Button style={css.raw({ flex: 'none' })} size="sm" variant="gray-outline" on:click={() => (open = true)}>
      연동해제
    </Button>
  {:else}
    <Button
      style={css.raw({ flex: 'none' })}
      size="sm"
      variant="gray-sub-fill"
      on:click={async () => {
        const { url } = await issueUserSingleSignOnAuthorizationUrl({
          type: 'LINK',
          provider,
        });

        mixpanel.track('user:single-sign-on:link:start', { provider });
        location.href = url;
      }}
    >
      연동하기
    </Button>
  {/if}
</div>

<Alert bind:open>
  <svelte:fragment slot="title">{providerName} 계정 연동을 해제할까요?</svelte:fragment>

  <svelte:fragment slot="action">
    <Button style={css.raw({ hideFrom: 'sm' })} size="lg" variant="gray-sub-fill" on:click={() => (open = false)}>
      취소
    </Button>
    <Button style={css.raw({ hideBelow: 'sm' })} size="lg" variant="gray-outline" on:click={() => (open = false)}>
      취소
    </Button>
    <Button
      size="lg"
      on:click={async () => {
        await unlinkUserSingleSignOn({ provider });
        mixpanel.track('user:single-sign-on:unlink', { provider });
        open = false;
      }}
    >
      해제
    </Button>
  </svelte:fragment>
</Alert>
