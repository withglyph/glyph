<script lang="ts">
  import * as R from 'radash';
  import { fragment, graphql } from '$glitch';
  import { Switch } from '$lib/components/forms';
  import type { MeNotificationsPage_Notification_user, UserNotificationCategory } from '$glitch';

  let _user: MeNotificationsPage_Notification_user;
  export { _user as $user };
  export let title: string;
  export let description: string;
  export let category: UserNotificationCategory;
  let open = false;

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
  <button
    class="flex items-center justify-between py-4 px-6 sm:p-0 sm:hidden"
    type="button"
    on:click={() => (open = !open)}
  >
    <div>
      <div class="text-lg font-extrabold">{title}</div>
      <p class="text-3.75 text-gray-50">
        {description}
      </p>
    </div>
    <span class="i-lc-chevron-down" />
  </button>
  <div class="flex flex-col justify-center <sm:hidden">
    <div class="text-lg font-extrabold">{title}</div>
    <p class="text-3.75 text-gray-50">
      {description}
    </p>
  </div>
  {#if open}
    <div class="flex flex-col bg-gray-10 py-4 px-6 space-y-6 sm:hidden">
      <div class="flex justify-between items-center">
        <span class="font-semibold">웹사이트</span>
        <Switch
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
      </div>

      <div class="flex justify-between items-center">
        <span class="font-semibold">이메일</span>
        <Switch
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
      </div>
    </div>
  {/if}
  <div class="flex items-center bg-white gap-8 <sm:hidden">
    <Switch
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

    <Switch
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
