<script lang="ts">
  import { graphql } from '$glitch';
  import { Button, Modal } from '$lib/components';
  import { DropDown, FormField, TextInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { CreateSpaceMemberInvitationSchema } from '$lib/validations';

  let open = false;

  $: query = graphql(`
    query SpaceSettingMembersPage_Query($slug: String!) {
      space(slug: $slug) {
        id
        slug
        name

        meAsMember {
          id
          role
        }

        members {
          id
          role

          profile {
            id
          }
        }

        invitations {
          id
          receivedEmail
        }
      }
    }
  `);

  const { form } = createMutationForm({
    mutation: graphql(`
      mutation SpaceSettingMembersPage_CreateSpaceMemberInvitation_Mutation($input: CreateSpaceMemberInvitationInput!) {
        createSpaceMemberInvitation(input: $input) {
          id
          receivedEmail
          space {
            id
            slug
            name
          }
        }
      }
    `),
    schema: CreateSpaceMemberInvitationSchema,
    onSuccess: () => {
      toast.success('스페이스 초대를 보냈어요');
      open = false;
    },
  });
</script>

<Button size="lg" on:click={() => (open = true)}>멤버 초대</Button>

<Modal bind:open>
  <svelte:fragment slot="title">스페이스 멤버 초대</svelte:fragment>

  <form use:form>
    <input name="spaceId" type="hidden" value={$query.space.id} />

    <div class="relative">
      <FormField name="email" class="peer" label="이메일">
        <TextInput class="w-full" placeholder="이메일 입력">
          <span slot="right-label" />
        </TextInput>
      </FormField>
      <DropDown
        name="role"
        class="absolute top-1/2 right-3.5 peer-[&:has(input[aria-invalid])]:top-10"
        optionTexts={['관리자', '창작자']}
        optionValues={['ADMIN', 'MEMBER']}
      />
    </div>

    <div class="flex w-full gap-3 mt-4">
      <Button class="grow" size="xl" type="submit">초대하기</Button>
      <Button class="grow-0" color="tertiary" size="xl" variant="outlined" on:click={() => (open = false)}>닫기</Button>
    </div>
  </form>
</Modal>
