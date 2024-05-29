<script lang="ts">
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Alert } from '$lib/components';
  import { Button, Modal } from '$lib/components/v2';
  import { FormField, TextInput } from '$lib/components/v2/forms';
  import { createMutationForm } from '$lib/form';
  import { UpdateUserEmailSchema } from '$lib/validations';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { MeSettingsPage_UpdateEmailModal_user } from '$glitch';

  export let open = false;

  let successOpen = false;
  let _user: MeSettingsPage_UpdateEmailModal_user;
  export { _user as $user };

  $: user = fragment(
    _user,
    graphql(`
      fragment MeSettingsPage_UpdateEmailModal_user on User {
        id
        email
      }
    `),
  );

  const { form, isSubmitting, handleSubmit } = createMutationForm({
    mutation: graphql(`
      mutation MeSettingsPage_UpdateUserEmail_Mutation($input: UpdateUserEmailInput!) {
        updateUserEmail(input: $input)
      }
    `),
    schema: UpdateUserEmailSchema,
    onSuccess: () => {
      mixpanel.track('user:email:update:start');
      open = false;
      successOpen = true;
    },
    onError: (resp) => {
      // @ts-expect-error form validation error
      toast.error(resp.message);
    },
  });
</script>

<Modal bind:open>
  <svelte:fragment slot="title">이메일 변경</svelte:fragment>

  <p class={css({ marginBottom: '6px', fontWeight: 'medium' })}>현재 이메일 주소</p>
  <p class={css({ fontSize: '14px', fontWeight: 'medium', color: 'gray.500' })}>{$user.email}</p>

  <p class={css({ marginTop: '42px', marginBottom: '2px', fontWeight: 'medium' })}>변경할 이메일 주소</p>
  <p class={css({ fontSize: '12px', color: 'gray.500' })}>
    이메일 주소 변경 후 변경된 이메일에서 인증을 완료해야 이메일이 변경됩니다.
  </p>

  <form class={flex({ flexDirection: 'column', gap: '16px', marginTop: '12px' })} use:form>
    <FormField name="email" hideLabel label="이메일 주소">
      <TextInput style={css.raw({ fontWeight: 'bold', width: 'full' })} placeholder="이메일 입력" />
    </FormField>
  </form>

  <Button
    slot="action"
    style={css.raw({ width: 'full' })}
    loading={$isSubmitting}
    size="lg"
    type="submit"
    on:click={handleSubmit}
  >
    이메일 인증 보내기
  </Button>
</Modal>

<Alert actionStyle={css.raw({ gridTemplateColumns: '1' })} bind:open={successOpen}>
  <p slot="title" class={css({ textAlign: 'left' })}>이메일 인증을 보냈어요</p>
  <p slot="content" class={css({ textAlign: 'left' })}>
    이메일 주소 변경 후 변경된 이메일에서 인증을 완료해야 이메일이 변경됩니다.
  </p>

  <svelte:fragment slot="action">
    <Button size="lg" on:click={() => (successOpen = false)}>확인</Button>
  </svelte:fragment>
</Alert>
