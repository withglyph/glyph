<script lang="ts">
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Modal } from '$lib/components';
  import { FormField, TextInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { VerifyPassportIdentitySchema } from '$lib/validations';

  export let open = false;

  const { form } = createMutationForm({
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
  });
</script>

<Modal bind:open>
  <svelte:fragment slot="title">여권 인증</svelte:fragment>

  <form use:form>
    <div class="space-y-2 max-h-110 overflow-y-auto">
      <FormField name="name" label="이름">
        <TextInput placeholder="예) 홍길동" />
      </FormField>

      <FormField name="passportNumber" label="여권 번호">
        <TextInput placeholder="예) M123A4567" />
      </FormField>

      <FormField name="birthday" label="생년월일">
        <TextInput minlength={8} placeholder="예) 20030301" type="numeric" />
      </FormField>

      <FormField name="issuedDate" label="여권 발행일자">
        <TextInput minlength={8} placeholder="예) 20210801" type="numeric" />
      </FormField>

      <FormField name="expirationDate" label="여권 만료일자">
        <TextInput minlength={8} placeholder="예) 20310801" type="numeric" />
      </FormField>
    </div>

    <Button class="w-full mt-4" size="xl" type="submit">여권 인증</Button>
  </form>
</Modal>
