<script lang="ts">
  import { graphql } from '$glitch';
  import { Avatar, Button, Modal } from '$lib/components';
  import { DropDown, FormField, TextInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { CreateSpaceMemberInvitationSchema } from '$lib/validations';
  import SearchBar from '../../../SearchBar.svelte';

  let open = false;
  let leaveSpaceOpen = false;
  let leaveSpaceSuccessOpen = false;

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
            name

            ...Avatar_profile
          }
        }

        invitations {
          id
          createdAt
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

  const leaveSpace = graphql(`
    mutation SpaceSettingMembersPage_LeaveSpace_Mutation($input: LeaveSpaceInput!) {
      leaveSpace(input: $input) {
        id
      }
    }
  `);
</script>

<div class="title-24-eb flex gap-4">
  <h2>멤버 관리</h2>
  <span class="text-secondary">{$query.space.members.length}</span>
</div>

<div class="p-4 max-w-200 bg-white border border-secondary rounded-xl">
  <div class="flex items-center justify-between">
    <SearchBar class="w-fit!" />

    <Button size="lg" on:click={() => (open = true)}>멤버 초대</Button>
  </div>

  <table class="w-full">
    <tr>
      <th class="w-50% text-left" scope="col">멤버</th>
      <th class="w-30% text-left <sm:hidden" scope="col">가입일</th>
      <th class="w-20% text-left" scope="col">권한</th>
    </tr>
    {#each $query.space.members as members (members.id)}
      <tr>
        <td class="flex items-center gap-3">
          <Avatar class="square-10.5" $profile={members.profile} />
          <div class="flex flex-col gap-1">
            <div class="flex gap-1 body-15-b">
              <span>{members.profile.name}</span>
              {#if $query.space.meAsMember?.id === members.id}
                (나)
              {/if}
            </div>
            <span class="text-secondary">kylie@penxle.io</span>
          </div>
        </td>
        <td class="<sm:hidden">2023.09.19</td>
        <td>
          <select
            value={members.role}
            on:change={(e) => {
              if (e.currentTarget.value === 'LEAVE') {
                leaveSpaceOpen = true;
              }
            }}
          >
            <option value="ADMIN">관리자</option>
            <option value="MEMBER">창작자</option>
            {#if $query.space.meAsMember?.id === members.id}
              <option value="LEAVE">탈퇴하기</option>
            {:else if $query.space.meAsMember?.role === 'ADMIN'}
              <option value="REMOVE">내보내기</option>
            {/if}
          </select>
        </td>
      </tr>
    {/each}
  </table>
</div>

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

<Modal size="sm" bind:open={leaveSpaceOpen}>
  <svelte:fragment slot="title">{$query.space.name}을 탈퇴할까요?</svelte:fragment>

  <div slot="action" class="flex gap-3 w-full">
    <Button class="w-full" color="secondary" size="xl" on:click={() => (leaveSpaceOpen = false)}>
      다시 생각해보기
    </Button>
    <Button
      class="w-full"
      size="xl"
      on:click={async () => {
        try {
          await leaveSpace({ spaceId: $query.space.id });
          leaveSpaceSuccessOpen = true;
        } catch {
          toast.error('오류가 발생했어요');
        }
        leaveSpaceOpen = false;
      }}
    >
      탈퇴하기
    </Button>
  </div>
</Modal>

<Modal size="sm" bind:open={leaveSpaceSuccessOpen}>
  <svelte:fragment slot="title">스페이스 탈퇴가 완료되었어요</svelte:fragment>

  <Button href="/" size="xl" type="link">홈으로 가기</Button>
</Modal>
