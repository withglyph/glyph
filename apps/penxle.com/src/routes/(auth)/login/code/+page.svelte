<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import IconGoogle from '~icons/simple-icons/google';
  import IconNaver from '~icons/simple-icons/naver';
  import IconMailCheck from '~icons/tabler/mail-check';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Icon } from '$lib/components';
  import { DigitsInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { IssueUserEmailAuthorizationUrlSchema } from '$lib/validations';

  $: email = $page.url.searchParams.get('email');

  let useCode = false;

  const { form } = createMutationForm({
    mutation: graphql(`
      mutation LoginCodePage_IssueUserEmailAuthorizationUrl_Mutation($input: IssueUserEmailAuthorizationUrlInput!) {
        issueUserEmailAuthorizationUrl(input: $input) {
          url
        }
      }
    `),
    schema: IssueUserEmailAuthorizationUrlSchema,
    onSuccess: (resp) => {
      mixpanel.track('user:login:success', { method: 'email:code' });
      location.href = resp.url;
    },
  });
</script>

<Helmet description="이메일로 전송된 코드를 통해 펜슬에 가입하거나 로그인할 수 있어요" title="코드로 시작하기" />

<div class="bg-green-50 rounded-full flex center square-16">
  <Icon class="text-white square-6" icon={IconMailCheck} />
</div>

{#if useCode}
  <div class="text-center mt-4 text-sm">
    {email}로 전송된 코드를 입력해주세요.
  </div>

  <form class="w-full max-w-87.5 mt-4" use:form>
    <input name="email" type="hidden" value={email} />

    <div class="space-y-3 flex justify-center">
      <DigitsInput name="code" />
    </div>

    <Button class="w-full mt-3" size="xl" type="submit">펜슬 시작하기</Button>
  </form>
{:else}
  <div class="text-center mt-4 text-sm">
    {email} 으로 펜슬 로그인 링크를 보냈어요!
    <br />
    메일을 열어 링크를 클릭하면 로그인이 완료돼요.
  </div>

  <Button class="w-full gap-2 mt-4" external={false} href="https://mail.naver.com" type="link">
    <Icon icon={IconNaver} />
    네이버 메일 열기
  </Button>

  <Button class="w-full gap-2 mt-2" external={false} href="https://gmail.com" type="link">
    <Icon icon={IconGoogle} />
    지메일 열기
  </Button>

  <button class="mt-4 text-sm text-gray-60" type="button" on:click={() => (useCode = true)}>대신 코드 입력하기</button>
{/if}

<a class="mt-4 text-sm text-gray-60" href="/login">이 이메일이 아닌가요?</a>
