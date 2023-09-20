<script lang="ts">
  import Camera from '$assets/icons/camera.svg?component';
  import { graphql } from '$glitch';
  import { Button, Modal } from '$lib/components';
  import { FormField, TextInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { UpdateUserProfileInputSchema } from '$lib/validations';

  let targetEl: HTMLInputElement;
  let value: HTMLInputElement['value'];

  export let open = false;

  const { form } = createMutationForm({
    mutation: graphql(`
      mutation AccountPage_UpdateProfileModal_UpdateUserProfile_Mutation(
        $input: UpdateUserProfileInput!
      ) {
        updateUserProfile(input: $input) {
          id
        }
      }
    `),
    schema: UpdateUserProfileInputSchema,
    onSuccess: () => {
      open = false;
    },
  });
</script>

<Modal size="md" bind:open>
  <svelte:fragment slot="title">프로필 수정</svelte:fragment>

  <form use:form>
    <input bind:this={targetEl} accept="image/*" type="file" />
    <button
      class="bg-gray-5 square-80 rounded-6 flex flex-col center w-full"
      type="button"
    >
      <Camera class="square-10 fill-gray-40" />
      <span class="text-gray-50 text-sm font-bold mt-2">
        프로필 사진 업로드
      </span>
    </button>

    <FormField name="name" label="닉네임">
      <TextInput
        class="w-full font-bold"
        maxlength={10}
        placeholder="닉네임 입력"
        bind:value
      >
        <span slot="right-icon">{value ? value.length : 0} / 10</span>
      </TextInput>
    </FormField>

    <Button class="w-full mt-4" size="xl" type="submit">수정</Button>
  </form>
</Modal>
