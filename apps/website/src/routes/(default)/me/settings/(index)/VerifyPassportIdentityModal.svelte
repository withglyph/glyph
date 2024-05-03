<script lang="ts">
  import { graphql } from '$bifrost';
  import { mixpanel } from '$lib/analytics';
  import { Button, Modal } from '$lib/components/v2';
  import { FormField, TextInput } from '$lib/components/v2/forms';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { VerifyPassportIdentitySchema } from '$lib/validations';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

  export let open = false;

  const { form, handleSubmit, isSubmitting } = createMutationForm({
    mutation: graphql(`
      mutation MeSettingsPage_VerifyPassportIdentityModal_VerifyPassportIdentity_Mutation(
        $input: VerifyPassportIdentityInput!
      ) {
        verifyPassportIdentity(input: $input) {
          id

          personalIdentity {
            id
          }
        }
      }
    `),
    schema: VerifyPassportIdentitySchema,
    onSuccess: () => {
      mixpanel.track('user:verify-passport-identity');
      open = false;
    },
    onError: (resp) => {
      // @ts-expect-error form validation error
      toast(resp.message);
    },
  });
</script>

<Modal bind:open>
  <svelte:fragment slot="title">여권 인증</svelte:fragment>

  <form class={flex({ direction: 'column', gap: '16px' })} use:form>
    <FormField name="name" label="이름">
      <TextInput placeholder="예) 홍길동" />
    </FormField>

    <FormField name="passportNumber" label="여권번호">
      <TextInput placeholder="예) M123A4567" />
    </FormField>

    <FormField name="birthday" label="생년월일">
      <TextInput minlength={8} placeholder="예) 20030301" type="numeric" />
    </FormField>

    <FormField name="issuedDate" label="발행일자">
      <TextInput minlength={8} placeholder="예) 20210801" type="numeric" />
    </FormField>

    <FormField name="expirationDate" label="만료일자">
      <TextInput minlength={8} placeholder="예) 20310801" type="numeric" />
    </FormField>
  </form>

  <Button slot="action" style={css.raw({ width: 'full' })} loading={$isSubmitting} size="lg" on:click={handleSubmit}>
    확인
  </Button>
</Modal>
