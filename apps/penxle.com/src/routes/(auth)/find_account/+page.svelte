<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import clsx from 'clsx';
  import { goto } from '$app/navigation';
  import { graphql } from '$glitch';
  import { Button } from '$lib/components';
  import { FormField, TextInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { LoginInputSchema } from '$lib/validations';
  import type { HTMLInputAttributes } from 'svelte/elements';

  let value: HTMLInputAttributes['value'];
  let isSuccessful = true;

  const { form } = createMutationForm({
    mutation: graphql(`
      mutation LoginPage_Login_Mutation2($input: LoginInput!) {
        login(input: $input) {
          __typename
        }
      }
    `),
    schema: LoginInputSchema,
    refetch: false,
    onSuccess: async () => {
      await goto('/');
    },
  });
</script>

<Helmet title="계정 찾기" />

<h1 class="font-bold text-xl w-full max-w-87.5">계정 찾기</h1>

<form class="w-full max-w-87.5 mt-6" use:form>
  <FormField name="email" label="이메일">
    <TextInput class="w-full font-bold" placeholder="이메일 입력" bind:value />
  </FormField>

  {#if isSuccessful}
    <div
      class="h-10 flex gap-2 items-center text-green-50 bg-green-10 py-3 px-4 rounded-2xl font-bold text-3.25 mt-1.5 mb-4"
    >
      <span class="i-lc-check-circle-2 w-4 h-4" />
      이메일로 전송된 로그인 링크를 확인하세요
    </div>
  {/if}

  <Button
    class={clsx(!isSuccessful && 'mt-6', 'w-full')}
    size="xl"
    type="submit"
  >
    계정 찾기
  </Button>
</form>
