<script lang="ts">
  import { flip, offset, shift } from '@floating-ui/dom';
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import ky from 'ky';
  // import * as R from 'radash';
  import { tick } from 'svelte';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Image, Modal } from '$lib/components';
  import { FormField, Switch, TextInput } from '$lib/components/forms';
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

        notifications {
          __typename
          id
          category
          data
          state
          createdAt

          actor {
            id
            name
          }

          ... on SubscribeNotification {
            id

            space {
              id
              name
            }
          }

          ... on PurchaseNotification {
            id

            post {
              id

              publishedRevision {
                id
                title
              }
            }
          }
        }

        # receivedSpaceMemberInvitations {
        #   id
        #   createdAt
        #   state

        #   space {
        #     id
        #     slug
        #     name
        #   }
        # }
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

  // const ignoreSpaceMemberInvitation = graphql(`
  //   mutation DefaultLayout_Notification_IgnoreSpaceMemberInvitation_Mutation(
  //     $input: IgnoreSpaceMemberInvitationInput!
  //   ) {
  //     ignoreSpaceMemberInvitation(input: $input) {
  //       id
  //     }
  //   }
  // `);

  const [floatingRef, floatingContent, update] = createFloatingActions({
    strategy: 'absolute',
    placement: 'bottom-end',
    middleware: [offset(4), flip(), shift({ padding: 8 })],
  });

  $: if (open) {
    // eslint-disable-next-line unicorn/prefer-top-level-await
    void tick().then(() => update());
  }

  // $: invitations = R.alphabetical($user.receivedSpaceMemberInvitations, (invitation) => invitation.createdAt, 'desc');

  $: setInitialValues({ profileName: $user.profile.name, profileAvatarId: avatar.id, invitationId });

  const markNotificationAsRead = graphql(`
    mutation DefaultLayout_Notification_MarkNotificationAsRead_Mutation($input: MarkNotificationAsReadInput!) {
      markNotificationAsRead(input: $input) {
        id
        state
      }
    }
  `);

  $: checkUnreadNotification = $user.notifications.find((notification) => notification.state === 'UNREAD');
  $: unreadNotifications = $user.notifications.filter((notification) => notification.state === 'UNREAD');

  const readAllNotifications = () => {
    mixpanel.track('user:notification-state:read', { via: 'notification-popup' });
    return Promise.all(unreadNotifications.map(({ id }) => markNotificationAsRead({ notificationId: id })));
  };

  const redirect = async (notification: (typeof $user.notifications)[0]) => {
    if (notification.state === 'UNREAD') {
      await markNotificationAsRead({ notificationId: notification.id });
      mixpanel.track('user:notification-state:read', { via: 'notification-popup' });
    }

    const resp = await ky.get(`/api/notification/${notification.id}`);
    await goto(resp.url);
  };
</script>

<div class="flex center mx-3 relative">
  <a class="square-10 rounded-full square-10 flex center sm:hidden" href="/me/notifications">
    <i class="i-px-bell-fill square-5 color-text-secondary" />
  </a>

  <button
    class="square-10 rounded-full flex center transition color-text-secondary hover:bg-surface-primary aria-pressed:(bg-yellow-10 color-yellow-50!) <sm:hidden"
    aria-pressed={open}
    type="button"
    on:click={() => (open = true)}
    use:floatingRef
  >
    <i class="i-px-bell-fill square-5" />
  </button>

  {#if checkUnreadNotification}
    <span class="square-2 rounded-full absolute top-1 right-1 bg-red-50" />
  {/if}
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

  <div
    class="absolute z-50 w-full max-w-95 flex flex-col rounded-2xl bg-cardprimary p-4 shadow-[0_2px_10px_0_rgba(0,0,0,0.10)]"
    use:floatingContent
    use:portal
  >
    <div class="flex items-center justify-between">
      <p class="subtitle-18-b">알림</p>
      <a
        class="rounded-full square-6.5 flex center transition hover:bg-primary"
        href="/me/settings/notifications"
        on:click={() => (open = false)}
      >
        <i class="i-lc-settings color-icon-secondary square-5" />
      </a>
    </div>

    <hr class="w-full border-color-alphagray-10 my-4" />

    <ul class="space-y-3 max-h-110 overflow-y-auto min-h-30">
      {#each $user.notifications.slice(0, 20) as notification (notification.id)}
        <li>
          <button
            class={clsx(
              'border border-secondary rounded-2xl bg-primary p-4 w-full flex gap-3 items-start hover:bg-surface-primary transition',
              notification.state === 'UNREAD' && 'border-yellow-30! bg-yellow-10! hover:bg-yellow-20!',
            )}
            type="button"
            on:click={() => redirect(notification)}
          >
            <svg class="rounded-lg flex-none square-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <rect fill="#0c0a091a" height="24" width="24" />
              <path
                d="M7.36 3.86c2.3 5.04.42 10.01-.1 11.36-.08.23-.13.36-.11.36a15.7 15.7 0 0 1 9.45 4.6l-1.58-2.74L13 14.07a1.1 1.1 0 1 1 .53-.35l3.53 6.11c-1.4-4.68.63-10.12.63-10.12-6.15-.67-10.33-5.85-10.33-5.85Z"
                fill="#FAFAF9"
              />
            </svg>

            <div class="space-y-1">
              <div>
                {#if notification.__typename === 'SubscribeNotification'}
                  <p class="body-15-b">{notification.space.name}에 새로운 구독자가 생겼어요!</p>
                  <p class="body-14-m text-secondary">{notification.actor.name}님을 환영해요!</p>
                {:else if notification.category === 'TREND'}
                  <p class="body-15-b">포스트 조회수가 급상승하고 있어요!</p>
                {:else if notification.__typename === 'PurchaseNotification'}
                  <p class="body-15-b">{notification.post.publishedRevision?.title} 포스트를 구매했어요!</p>
                {/if}
              </div>
              <time class="body-13-m text-disabled">{dayjs(notification.createdAt).formatAsDateTime()}</time>
            </div>
          </button>
        </li>
      {:else}
        <p class="text-center text-secondary body-14-b">알림이 없어요</p>
      {/each}

      {#if $user.notifications.length > 20}
        <Button class="body-15-b text-disabled" href="/me/notifications" size="sm" type="link" variant="text">
          알림 더보기
        </Button>
      {/if}

      <!-- {#each invitations as invitation (invitation.space.id)}
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
      {/each} -->
    </ul>

    {#if $user.notifications.length > 0}
      <div class="flex justify-end mt-2">
        <Button size="md" on:click={async () => await readAllNotifications()}>모두 읽음</Button>
      </div>
    {/if}
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
