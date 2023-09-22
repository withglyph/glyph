<script lang="ts">
  import * as R from 'radash';
  import { fragment, graphql } from '$glitch';
  import { Switch } from '$lib/components/forms';
  import type { MeNotificationsPage_Notification_user } from '$glitch';
  import type { UserNotificationCategory } from '$glitch/gql';

  let _user: MeNotificationsPage_Notification_user;
  export { _user as $user };
  export let title: string;
  export let description: string;
  export let category: UserNotificationCategory;

  $: user = fragment(
    _user,
    graphql(`
      fragment MeNotificationsPage_Notification_user on User {
        notificationPreferences {
          id
          category
          method
          opted
        }
      }
    `),
  );

  const updateNotificationPreference = graphql(`
    mutation MeNotificationsPage_Notification_UpdateUserNotificationPreference_Mutation(
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

  $: preferences = R.group($user.notificationPreferences, (v) => v.category);
</script>

<div class="flex flex-col flex-wrap justify-center sm:(flex-row items-center justify-between flex-nowrap)">
  <div class="flex items-center justify-between py-4 px-6 sm:p-0">
    <div>
      <div class="text-lg font-extrabold">{title}</div>
      <p class="text-3.75 text-gray-50">
        {description}
      </p>
    </div>
    <button class="i-lc-chevron-down sm:hidden" type="button" />
  </div>
  <div class="flex flex-col bg-gray-10 py-4 px-6 space-y-6 sm:(space-y-0 flex-row items-center p-0 bg-white gap-8)">
    <div class="flex justify-between items-center">
      <span class="font-semibold sm:hidden">웹사이트</span>

      <Switch
        class="sm:hidden"
        checked={preferences[category]?.find((v) => v.method === 'WEBSITE')?.opted ?? true}
        disabled={preferences.ALL?.find((v) => v.method === 'WEBSITE')?.opted === false}
        size="sm"
        on:change={async (e) => {
          await updateNotificationPreference({
            category,
            method: 'WEBSITE',
            opted: e.currentTarget.checked,
          });
        }}
      />

      <Switch
        class="<sm:hidden"
        checked={preferences[category]?.find((v) => v.method === 'WEBSITE')?.opted ?? true}
        disabled={preferences.ALL?.find((v) => v.method === 'WEBSITE')?.opted === false}
        size="lg"
        on:change={async (e) => {
          await updateNotificationPreference({
            category,
            method: 'WEBSITE',
            opted: e.currentTarget.checked,
          });
        }}
      />
    </div>

    <div class="flex justify-between items-center">
      <span class="font-semibold sm:hidden">이메일</span>

      <Switch
        class="sm:hidden"
        checked={preferences[category]?.find((v) => v.method === 'EMAIL')?.opted ?? true}
        disabled={preferences.ALL?.find((v) => v.method === 'EMAIL')?.opted === false}
        size="sm"
        on:change={async (e) => {
          await updateNotificationPreference({
            category,
            method: 'EMAIL',
            opted: e.currentTarget.checked,
          });
        }}
      />

      <Switch
        class="<sm:hidden"
        checked={preferences[category]?.find((v) => v.method === 'EMAIL')?.opted ?? true}
        disabled={preferences.ALL?.find((v) => v.method === 'EMAIL')?.opted === false}
        size="lg"
        on:change={async (e) => {
          await updateNotificationPreference({
            category,
            method: 'EMAIL',
            opted: e.currentTarget.checked,
          });
        }}
      />
    </div>
  </div>
</div>
