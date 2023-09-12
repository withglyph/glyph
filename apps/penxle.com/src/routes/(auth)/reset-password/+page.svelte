<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { goto } from '$app/navigation';
  import { graphql } from '$glitch';
  import { Button, Modal } from '$lib/components';
  import { FormField, PasswordInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { LoginInputSchema } from '$lib/validations';

  let open = false;

  const { form } = createMutationForm({
    mutation: graphql(`
      mutation LoginPage_Login_Mutation3($input: LoginInput!) {
        login(input: $input) {
          __typename
        }
      }
    `),
    schema: LoginInputSchema,
    refetch: false,
    onSuccess: () => {
      open = true;
    },
  });
</script>

<Helmet title="비밀번호 재설정" />

<h1 class="font-bold text-xl w-full max-w-87.5 mb-6">
  새로운 비밀번호를 설정해 주세요
</h1>

<form class="w-full max-w-87.5 space-y-4" use:form>
  <FormField name="password" label="비밀번호">
    <PasswordInput class="w-full font-bold" placeholder="비밀번호 입력" />
  </FormField>

  <FormField name="passwordConfirm" label="비밀번호 확인">
    <PasswordInput class="w-full font-bold" placeholder="비밀번호 확인 입력" />
  </FormField>

  <Button class="w-full" size="xl" type="button" on:click={() => (open = true)}>
    비밀번호 재설정하기
  </Button>
</form>

<Modal size="sm" bind:open>
  <svelte:fragment slot="title">비밀번호가 재설정 되었어요</svelte:fragment>

  <Button
    slot="action"
    class="w-full"
    size="xl"
    on:click={() => goto('/login')}
  >
    로그인하러가기
  </Button>
</Modal>
