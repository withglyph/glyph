<script lang="ts">
  import { flip, offset, shift } from '@floating-ui/dom';
  import * as R from 'radash';
  import { tick } from 'svelte';
  import { fragment, graphql } from '$glitch';
  import { Button, Modal } from '$lib/components';
  import { FormField, Switch, TextInput } from '$lib/components/forms';
  import Image from '$lib/components/Image.svelte';
  import { ThumbnailPicker } from '$lib/components/media';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { portal } from '$lib/svelte/actions';
  import { createFloatingActions } from '$lib/svelte-floating-ui';
  import { AcceptSpaceMemberInvitationSchema } from '$lib/validations';
  import type { DefaultLayout_Notification_user } from '$glitch';

  let _user: DefaultLayout_Notification_user;
  export { _user as $user };
  let open = false;
  let invitationOpen = false;
  let invitationId: string;
  let checked = true;
  let thumbnailPicker: ThumbnailPicker;

  $: user = fragment(
    _user,
    graphql(`
      fragment DefaultLayout_Notification_user on User {
        id
        profile {
          id
          name

          avatar {
            id
            ...Image_image
          }
        }

        receivedSpaceMemberInvitations {
          id
          createdAt
          state

          space {
            id
            slug
            name
          }
        }
      }
    `),
  );

  let avatar: typeof $user.profile.avatar;
  $: avatar = $user.profile.avatar;

  const { form, data, setInitialValues } = createMutationForm({
    mutation: graphql(`
      mutation DefaultLayout_Notification_AcceptSpaceMemberInvitation_Mutation(
        $input: AcceptSpaceMemberInvitationInput!
      ) {
        acceptSpaceMemberInvitation(input: $input) {
          id
          state
        }
      }
    `),
    schema: AcceptSpaceMemberInvitationSchema,
    initialValues: { profileName: '' },
    extra: () => ({ profileAvatarId: avatar.id }),
    onSuccess: () => {
      toast.success('초대를 수락했어요');
      invitationOpen = false;
    },
  });

  const ignoreSpaceMemberInvitation = graphql(`
    mutation DefaultLayout_Notification_IgnoreSpaceMemberInvitation_Mutation(
      $input: IgnoreSpaceMemberInvitationInput!
    ) {
      ignoreSpaceMemberInvitation(input: $input) {
        id
      }
    }
  `);

  const [floatingRef, floatingContent, update] = createFloatingActions({
    strategy: 'absolute',
    placement: 'bottom-start',
    middleware: [offset(4), flip(), shift({ padding: 8 })],
  });

  $: if (open) {
    // eslint-disable-next-line unicorn/prefer-top-level-await
    void tick().then(() => update());
  }

  $: invitations = R.alphabetical($user.receivedSpaceMemberInvitations, (invitation) => invitation.createdAt, 'desc');

  $: setInitialValues({ profileName: $user.profile.name, profileAvatarId: avatar.id, invitationId });
</script>

<div class="flex center square-10 mx-3 rounded-full transition hover:bg-surface-primary">
  <button
    class="i-px-bell-fill square-6 color-text-secondary"
    type="button"
    on:click={() => (open = true)}
    use:floatingRef
  />
</div>

{#if open}
  <div
    class="fixed inset-0 z-49"
    role="button"
    tabindex="-1"
    on:click={() => (open = false)}
    on:keypress={null}
    use:portal
  />

  <div class="z-50 w-80 flex flex-col border rounded bg-white py-2 shadow" use:floatingContent use:portal>
    <ul>
      {#each invitations as invitation (invitation.space.id)}
        <li class="flex gap-2">
          {invitation.space.name} 스페이스에 초대되었어요
          {#if invitation.state !== 'ACCEPTED'}
            <Button
              size="sm"
              on:click={() => {
                invitationId = invitation.id;
                invitationOpen = true;
              }}
            >
              수락
            </Button>
            {#if invitation.state !== 'IGNORED'}
              <Button
                color="tertiary"
                size="sm"
                variant="outlined"
                on:click={async () => {
                  try {
                    await ignoreSpaceMemberInvitation({
                      invitationId: invitation.id,
                    });
                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
                무시
              </Button>
            {/if}
          {/if}
        </li>
      {/each}
    </ul>
  </div>
{/if}

<Modal bind:open={invitationOpen}>
  <svelte:fragment slot="title">스페이스 가입</svelte:fragment>

  <Switch name="useSpaceProfile" class="flex items-center justify-between pb-2" bind:checked>
    <p class="body-16-b">스페이스 전용 프로필</p>
  </Switch>

  {#if checked}
    <p class="text-3.5 text-gray-50">스페이스 내에서만 사용되는 프로필이에요</p>
  {/if}

  <form class="mt-3" use:form>
    <input type="hidden" bind:value={invitationId} />

    <div class="flex gap-3">
      <button
        class="bg-primary square-18.5 rounded-xl overflow-hidden grow-0"
        type="button"
        on:click={() => thumbnailPicker.show()}
      >
        <Image class="square-full" $image={avatar} />
      </button>

      <FormField name="profileName" class="grow" label="스페이스 닉네임">
        <TextInput maxlength={20} placeholder="닉네임 입력">
          <span slot="right-icon" class="body-14-m text-disabled">{$data.profileName?.length ?? 0} / 20</span>
        </TextInput>
      </FormField>
    </div>

    <Button class="w-full mt-6" size="xl" type="submit">스페이스 가입</Button>
  </form>
</Modal>

<ThumbnailPicker bind:this={thumbnailPicker} on:change={(e) => (avatar = e.detail)} />
