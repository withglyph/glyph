<script lang="ts">
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button } from '$lib/components';
  import { DigitsInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { IssueUserEmailAuthorizationUrlSchema } from '$lib/validations';

  $: email = $page.url.searchParams.get('email');

  let useCode = false;
  let hiddenSubmitInputEl: HTMLInputElement | null = null;

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

<div class="bg-green-50 rounded-full flex center square-16">
  <i class="i-lc-mail-check text-white square-6" />
</div>

{#if useCode}
  <div class="text-center mt-4 text-sm">
    {email}로 전송된 코드를 입력해주세요.
  </div>

  <form class="w-full max-w-87.5 mt-4" use:form>
    <input name="email" type="hidden" value={email} />

    <div class="space-y-3 flex justify-center">
      <DigitsInput
        name="code"
        maxlength={6}
        on:input={({ currentTarget }) => {
          if (!currentTarget) throw new Error('currentTarget is null');
          if (!hiddenSubmitInputEl) throw new Error('hiddenSubmitInputEl is null');

          if (currentTarget.value.length === currentTarget.maxLength) {
            console.log('submit');
            hiddenSubmitInputEl.click();
          }
        }}
      />
    </div>

    <input bind:this={hiddenSubmitInputEl} class="hidden" type="submit" />
    <Button class="w-full mt-3" size="xl" type="submit">펜슬 시작하기</Button>
  </form>
{:else}
  <div class="text-center mt-4 text-sm">
    {email} 으로 펜슬 로그인 링크를 보냈어요!
    <br />
    메일을 열어 링크를 클릭하면 로그인이 완료돼요.
  </div>

  <Button class="w-full gap-2 mt-4" external={false} href="https://mail.naver.com" type="link">
    <i class="i-lg-naver" />
    네이버 메일 열기
  </Button>

  <Button class="w-full gap-2 mt-2" external={false} href="https://gmail.com" type="link">
    <i class="i-lg-google" />
    지메일 열기
  </Button>

  <button class="mt-4 text-sm text-gray-50" type="button" on:click={() => (useCode = true)}>대신 코드 입력하기</button>
{/if}

<a class="mt-4 text-sm text-gray-50" href="/login">이 이메일이 아닌가요?</a>
