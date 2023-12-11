<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import * as R from 'radash';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Switch } from '$lib/components/forms';
  import NotificationSwitch from './NotificationSwitch.svelte';

  $: query = graphql(`
    query MeSettingsNotificationsPage_Query {
      auth(scope: USER)

      me @_required {
        id

        notificationPreferences {
          id
          category
          method
          opted
        }

        ...MeSettingsNotificationsPage_Notification_user
      }
    }
  `);

  const updateNotificationPreference = graphql(`
    mutation MeSettingsNotificationsPage_UpdateUserNotificationPreference_Mutation(
      $input: UpdateUserNotificationPreferenceInput!
    ) {
      updateUserNotificationPreference(input: $input) {
        id

        notificationPreferences {
          id
          category
          method
          opted
        }
      }
    }
  `);

  $: preferences = R.group($query.me.notificationPreferences, (v) => v.category);
</script>

<Helmet title="알림 설정" />

<div class="sm:(space-y-8 p-8)">
  <div class="hidden justify-end gap-8 text-3.75 text-secondary sm:flex">
    <span>웹사이트</span>
    <span>이메일</span>
  </div>
  <div class="flex flex-wrap items-center justify-between gap-4 pt-14 py-4 px-6 sm:p-0">
    <div class="text-lg font-extrabold">알림 켜기 / 끄기</div>
    <Switch
      class="sm:hidden"
      checked={preferences.ALL?.some((v) => v.opted) ?? true}
      on:change={async (e) => {
        const opted = e.currentTarget.checked;

        await updateNotificationPreference({
          category: 'ALL',
          method: 'WEBSITE',
          opted,
        });

        await updateNotificationPreference({
          category: 'ALL',
          method: 'EMAIL',
          opted,
        });

        mixpanel.track('user:notification-preference:update', { category: 'ALL', method: 'WEBSITE', opted });
        mixpanel.track('user:notification-preference:update', { category: 'ALL', method: 'EMAIL', opted });
      }}
    />

    <div class="hidden sm:(flex gap-8)">
      <Switch
        checked={preferences.ALL?.find((v) => v.method === 'WEBSITE')?.opted ?? true}
        on:change={async (e) => {
          const category = 'ALL';
          const method = 'WEBSITE';
          const opted = e.currentTarget.checked;

          await updateNotificationPreference({ category, method, opted });
          mixpanel.track('user:notification-preference:update', { category, method, opted });
        }}
      />

      <Switch
        checked={preferences.ALL?.find((v) => v.method === 'EMAIL')?.opted ?? true}
        on:change={async (e) => {
          const category = 'ALL';
          const method = 'EMAIL';
          const opted = e.currentTarget.checked;

          await updateNotificationPreference({ category, method, opted });
          mixpanel.track('user:notification-preference:update', { category, method, opted });
        }}
      />
    </div>
  </div>

  <NotificationSwitch
    $user={$query.me}
    category="COMMENT"
    description="내 포스트에 댓글이 달렸을 때 알림을 받아요."
    title="댓글"
  />

  <NotificationSwitch
    $user={$query.me}
    category="REPLY"
    description="댓글에 답글이 달렸을 때 알림을 받아요."
    title="답글"
  />

  <NotificationSwitch
    $user={$query.me}
    category="SUBSCRIBE"
    description="스페이스 구독자가 생겼을 때 알림을 받아요."
    title="스페이스 구독"
  />

  <NotificationSwitch
    $user={$query.me}
    category="TAG_EDIT"
    description="내 포스트 태그를 수정했을 때 알림을 받아요."
    title="태그 수정"
  />

  <NotificationSwitch
    $user={$query.me}
    category="TREND"
    description="조회수가 급상승했을 때 알림을 받아요."
    title="조회수"
  />

  <NotificationSwitch
    $user={$query.me}
    category="PURCHASE"
    description="내 포스트가 구매됐을 때 알림을 받아요."
    title="구매"
  />

  <NotificationSwitch
    $user={$query.me}
    category="DONATE"
    description="내 포스트에 후원을 받았을 때 알림을 받아요."
    title="후원"
  />

  <NotificationSwitch
    $user={$query.me}
    category="TAG_WIKI_EDIT"
    description="내가 작성한 태그가 수정됐을 때 알림을 받아요."
    title="태그 위키 수정"
  />
</div>
