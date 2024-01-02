<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { onMount } from 'svelte';
  import { graphql } from '$glitch';
  import { Avatar, Button, Modal } from '$lib/components';
  import { DropDown, FormField, PopupSearch, TextInput } from '$lib/components/forms';
  import { Table, TableData, TableHead, TableRow } from '$lib/components/table';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { pageSubTitle } from '$lib/stores';
  import { CreateSpaceMemberInvitationSchema } from '$lib/validations';

  let open = false;
  let leaveSpaceOpen = false;
  let leaveSpaceSuccessOpen = false;
  let removeMemberOpen = false;
  let removeMember: (typeof $query.space.members)[0];

  onMount(async () => {
    pageSubTitle.set('멤버 관리');
  });

  $: query = graphql(`
    query SpaceDashboardMembersPage_Query($slug: String!) {
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
          email

          profile {
            id
            name

            ...Avatar_profile
          }
        }

        invitations {
          id
          receivedEmail
          state
        }
      }
    }
  `);

  const { form } = createMutationForm({
    mutation: graphql(`
      mutation SpaceDashboardMembersPage_CreateSpaceMemberInvitation_Mutation(
        $input: CreateSpaceMemberInvitationInput!
      ) {
        createSpaceMemberInvitation(input: $input) {
          id
          receivedEmail
          state

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
      toast.success('초대 링크를 전송했어요');
      open = false;
    },
  });

  const leaveSpace = graphql(`
    mutation SpaceDashboardMembersPage_LeaveSpace_Mutation($input: LeaveSpaceInput!) {
      leaveSpace(input: $input) {
        id
      }
    }
  `);

  const removeSpaceMember = graphql(`
    mutation SpaceDashboardMembersPage_RemoveSpaceMember_Mutation($input: RemoveSpaceMemberInput!) {
      removeSpaceMember(input: $input) {
        id
      }
    }
  `);
</script>

<Helmet title={`멤버 관리 | ${$query.space.name}`} />

<div class="title-24-eb flex gap-4 mb-6 <sm:hidden">
  <h2>멤버 관리</h2>
  <span class="text-secondary">{$query.space.members.length}</span>
</div>

<div class="px-4 py-6 bg-white border border-secondary rounded-xl sm:px-6">
  <div class="flex items-center justify-between mb-6 gap-2">
    <PopupSearch class="max-w-82.5" />

    <!-- {#if $query.space.meAsMember?.role === 'ADMIN'}
      <Button size="lg" on:click={() => (open = true)}>멤버 초대</Button>
    {/if} -->
  </div>

  <Table>
    <TableRow>
      <TableHead class="w-50% text-left <xs:w-80%">멤버</TableHead>
      <TableHead class="w-30% text-left <xs:hidden">가입일</TableHead>
      <TableHead class="w-20% text-right">권한</TableHead>
    </TableRow>

    {#each $query.space.members as member (member.id)}
      <TableRow>
        <TableData class="flex items-center gap-3">
          <Avatar class="square-10.5 grow-0 flex-none <xs:square-8" $profile={member.profile} />
          <div class="flex flex-col gap-1 grow-1 truncate">
            <div class="flex gap-1 body-15-b truncate">
              <span class="truncate">{member.profile.name}</span>
              {#if $query.space.meAsMember?.id === member.id}
                (나)
              {/if}
            </div>
            <span class="body-14-m text-secondary truncate">{member.email}</span>
          </div>
        </TableData>
        <TableData class="body-13-b text-secondary <xs:hidden">2023.09.19</TableData>
        <TableData class="text-right">
          {#if $query.space.meAsMember?.role === 'ADMIN'}
            <select
              class="body-14-b text-secondary"
              value={member.role}
              on:change={(e) => {
                if (e.currentTarget.value === 'LEAVE') {
                  leaveSpaceOpen = true;
                } else if (e.currentTarget.value === 'REMOVE') {
                  removeMemberOpen = true;
                  removeMember = member;
                }
              }}
            >
              <option value="ADMIN">관리자</option>
              <option value="MEMBER">창작자</option>
              {#if $query.space.meAsMember?.id !== member.id}
                <option value="REMOVE">내보내기</option>
              {:else}
                <option value="LEAVE">탈퇴하기</option>
              {/if}
            </select>
          {/if}
          {#if $query.space.meAsMember?.role === 'MEMBER' && $query.space.meAsMember?.id === member.id}
            <select
              class="body-14-b text-secondary"
              value={member.role}
              on:change={(e) => {
                if (e.currentTarget.value === 'LEAVE') {
                  leaveSpaceOpen = true;
                }
              }}
            >
              <option selected value="LEAVE">탈퇴하기</option>
            </select>
          {/if}
        </TableData>
      </TableRow>
    {/each}

    {#each $query.space.invitations as invitation (invitation.id)}
      {#if invitation.state !== 'ACCEPTED'}
        <TableRow>
          <TableData class="flex items-center gap-3">
            <div class="square-10.5 rounded-full border border-primary border-dashed grow-0 <xs:square-8" />
            <div class="flex flex-col gap-1 truncate grow-1">
              <span class="body-15-b text-secondary truncate">{invitation.receivedEmail}</span>
            </div>
          </TableData>
          <TableData class="body-13-b text-secondary <xs:hidden">-</TableData>
          <TableData class="text-right">
            {#if $query.space.meAsMember?.role === 'ADMIN'}
              <select class="body-14-b text-secondary">
                <option value="ADMIN">관리자</option>
                <option value="MEMBER">창작자</option>
                <option value="CANCEL">초대 취소</option>
              </select>
            {/if}
          </TableData>
        </TableRow>
      {/if}
    {/each}
  </Table>
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
  <svelte:fragment slot="title">'{$query.space.name}' 을 탈퇴할까요?</svelte:fragment>

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

<Modal size="sm" bind:open={removeMemberOpen}>
  <svelte:fragment slot="title">'{removeMember.profile.name}' 님을 내보내시겠어요?</svelte:fragment>

  <div slot="action" class="flex gap-3 w-full">
    <Button class="w-full" color="secondary" size="xl" on:click={() => (leaveSpaceOpen = false)}>
      다시 생각해보기
    </Button>
    <Button
      class="w-full"
      size="xl"
      on:click={async () => {
        try {
          await removeSpaceMember({ spaceMemberId: removeMember.id });
          toast.success(`${removeMember.profile.name}님을 내보냈어요`);
        } catch {
          toast.error('오류가 발생했어요');
        }
        removeMemberOpen = false;
      }}
    >
      내보내기
    </Button>
  </div>
</Modal>
