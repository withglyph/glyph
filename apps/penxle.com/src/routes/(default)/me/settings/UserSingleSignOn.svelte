<script lang="ts">
  import * as R from 'radash';
  import Google from '$assets/icons/google.svg?component';
  import Naver from '$assets/icons/naver.svg?component';
  import Twitter from '$assets/icons/twitter.svg?component';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Modal } from '$lib/components';
  import { toast } from '$lib/notification';
  import type { MeSettingsPage_UserSingleSignOn_user, UserSingleSignOnProvider } from '$glitch';

  let _user: MeSettingsPage_UserSingleSignOn_user;
  export { _user as $user };

  export let provider: UserSingleSignOnProvider;
  let open = false;
  let providerName = {
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

<div class="flex flex-wrap items-center justify-between gap-4">
  <div class="flex items-center gap-3">
    <div class="square-9 flex center">
      {#if provider === 'GOOGLE'}
        <Google class="square-9" />
      {:else if provider === 'NAVER'}
        <Naver class="sqauare-9" />
      {:else if provider === 'TWITTER'}
        <Twitter class="sqauare-9" />
      {/if}
    </div>
    <div>
      <h3 class="text-lg font-extrabold mr-2">{R.capitalize(provider)}</h3>
      {#if singleSignOns[provider]}
        <p class="text-3.75 text-secondary break-keep">
          {singleSignOns[provider].email}
        </p>
      {/if}
    </div>
  </div>
  {#if singleSignOns[provider]}
    <Button color="tertiary" size="md" variant="outlined" on:click={() => (open = true)}>연동 해제</Button>
  {:else}
    <Button
      color="secondary"
      size="md"
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

<Modal size="sm" bind:open>
  <svelte:fragment slot="title">{providerName} 계정 연동을 해제할까요?</svelte:fragment>

  <div slot="action" class="flex gap-3 w-full">
    <Button class="w-full" color="secondary" size="xl" on:click={() => (open = false)}>돌아가기</Button>
    <Button
      class="w-full"
      size="xl"
      on:click={async () => {
        await unlinkUserSingleSignOn({ provider });
        mixpanel.track('user:single-sign-on:unlink', { provider });
        toast.success(`${providerName} 계정 연동이 해제되었어요`);
        open = false;
      }}
    >
      해제하기
    </Button>
  </div>
</Modal>
