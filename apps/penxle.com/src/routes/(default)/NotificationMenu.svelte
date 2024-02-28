<script lang="ts">
  // import * as R from 'radash';
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import ky from 'ky';
  import IconBell from '~icons/tabler/bell';
  import IconCheck from '~icons/tabler/check';
  import IconCoin from '~icons/tabler/coin';
  import IconMessageCircle from '~icons/tabler/message-circle';
  import IconX from '~icons/tabler/x';
  import { beforeNavigate, goto } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Icon, Image, Modal } from '$lib/components';
  import { FormField, Switch, TextInput } from '$lib/components/forms';
  import { ThumbnailPicker } from '$lib/components/media';
  import { Button } from '$lib/components/v2';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { createFloatingActions, portal } from '$lib/svelte/actions';
  import { AcceptSpaceMemberInvitationSchema } from '$lib/validations';
  import type { DefaultLayout_NotificationMenu_user } from '$glitch';

  let _user: DefaultLayout_NotificationMenu_user;
  export { _user as $user };

  let open = false;
  let invitationOpen = false;
  let invitationId: string;
  let checked = true;
  let thumbnailPicker: ThumbnailPicker;

  $: user = fragment(
    _user,
    graphql(`
      fragment DefaultLayout_NotificationMenu_user on User {
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

          ... on CommentNotification {
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

  const { anchor, floating } = createFloatingActions({
    placement: 'bottom-end',
    offset: 8,
  });

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

  beforeNavigate(() => {
    open = false;
  });
</script>

<div class="flex center relative">
  <a class="square-8.5 rounded-full flex center sm:hidden" href="/me/notifications">
    <Icon class="square-5" icon={IconBell} />
  </a>

  <button
    class="square-9 rounded-full flex center transition color-gray-700 hover:bg-gray-100 aria-pressed:(bg-yellow-10 bg-gray-100!) <sm:hidden"
    aria-pressed={open}
    type="button"
    on:click={() => (open = true)}
    use:anchor
  >
    <Icon class="square-5" icon={IconBell} />
  </button>

  {#if checkUnreadNotification}
    <span class="square-2 rounded-full absolute top-0 right-0 bg-red-50" />
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
    class="absolute z-50 w-full max-w-375px flex flex-col rounded-2.5 bg-white shadow-[0px_5px_22px_0px_rgba(0,0,0,0.06)]"
    use:floating
  >
    <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 h-55px">
      <p class="text-16-sb">알림</p>

      <button type="button" on:click={() => (open = false)}>
        <Icon class="square-5" icon={IconX} />
      </button>
    </div>

    <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 h-55px">
      <p>
        새소식 <mark class="text-16-m text-teal-500">{unreadNotifications.length}</mark>
      </p>

      {#if $user.notifications.length > 0}
        <Button class="text-12-sb" size="sm" variant="outline" on:click={async () => await readAllNotifications()}>
          모두 읽기
        </Button>
      {/if}
    </div>

    <ul class="max-h-110 overflow-y-auto min-h-30">
      {#each $user.notifications.slice(0, 20) as notification (notification.id)}
        <li>
          <button
            class={clsx(
              'border-b border-gray-100 px-4 py-5 w-full hover:bg-gray-100 transition',
              notification.state === 'UNREAD' && 'bg-teal-50',
            )}
            type="button"
            on:click={() => redirect(notification)}
          >
            <div
              class={clsx(
                'text-13-r flex items-center gap-1 text-gray-500',
                notification.state === 'UNREAD' && 'text-teal-500',
              )}
            >
              {#if notification.__typename === 'SubscribeNotification'}
                <Icon class="square-3 block" icon={IconCheck} />
                스페이스 구독
              {:else if notification.__typename === 'PurchaseNotification'}
                <Icon class="square-3 block" icon={IconCoin} />
                구매
              {:else if notification.__typename === 'CommentNotification'}
                <Icon class="square-3 block" icon={IconMessageCircle} />
                댓글
              {/if}
            </div>
            <div class="text-14-m px-3">
              {#if notification.__typename === 'SubscribeNotification'}
                {notification.actor.name}님이 {notification.space.name.length > 10
                  ? `${notification.space.name.slice(0, 10)}...`
                  : notification.space.name} 스페이스를 구독했어요
              {:else if notification.category === 'TREND'}
                포스트 조회수가 급상승하고 있어요
              {:else if notification.__typename === 'PurchaseNotification'}
                {notification.actor.name}님이 {notification.post.publishedRevision?.title ?? '(제목 없음)'} 포스트를 구매했어요
              {:else if notification.__typename === 'CommentNotification'}
                {notification.actor.name}님이 {notification.post.publishedRevision?.title ?? '(제목 없음)'}에 댓글을
                달았어요
              {/if}
            </div>
            <time class="text-10-l text-gray-400 text-right w-full inline-block">
              {dayjs(notification.createdAt).formatAsDateTime()}
            </time>
          </button>
        </li>
      {:else}
        <li class="text-center text-secondary body-14-b">알림이 없어요</li>
      {/each}

      {#if $user.notifications.length > 20}
        <li>
          <a class="text-14-r text-gray-400 inline-block w-full text-center" href="/me/notifications" type="link">
            더보기
          </a>
        </li>
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
  </div>
{/if}

<Modal bind:open={invitationOpen}>
  <svelte:fragment slot="title">스페이스 가입</svelte:fragment>

  <Switch name="useSpaceProfile" class="flex items-center justify-between pb-2" bind:checked>
    <p class="body-16-b">스페이스 전용 프로필</p>
  </Switch>

  {#if checked}
    <p class="text-3.5 text-gray-60">스페이스 내에서만 사용되는 프로필이에요</p>
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
