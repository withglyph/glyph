<script lang="ts">
  import * as R from 'radash';
  import { fragment, graphql } from '$glitch';
  import { analytics } from '$lib/analytics';
  import { Switch } from '$lib/components/forms';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { MeSettingsNotificationsPage_Notification_user, UserNotificationCategory } from '$glitch';

  let _user: MeSettingsNotificationsPage_Notification_user;
  export { _user as $user };
  export let title: string;
  export let description: string;
  export let category: UserNotificationCategory;

  $: user = fragment(
    _user,
    graphql(`
      fragment MeSettingsNotificationsPage_Notification_user on User {
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
    mutation MeSettingsNotificationsPage_Notification_UpdateUserNotificationPreference_Mutation(
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

<div
  class={flex({
    align: 'center',
    justify: 'space-between',
    gap: '16px',
  })}
>
  <div>
    <div class={css({ marginBottom: '4px', fontWeight: 'semibold' })}>{title}</div>
    <p class={css({ fontSize: '13px', color: 'gray.500' })}>
      {description}
    </p>
  </div>

  <Switch
    style={css.raw({ hideFrom: 'sm' })}
    checked={preferences[category]?.find((v) => v.method === 'WEBSITE')?.opted ?? true}
    size="sm"
    on:change={async (e) => {
      const method = 'WEBSITE';
      const opted = e.currentTarget.checked;

      await updateNotificationPreference({ category, method, opted });
      analytics.track('user:notification-preference:update', { category, method, opted });
    }}
  />
  <Switch
    style={css.raw({ hideBelow: 'sm' })}
    checked={preferences[category]?.find((v) => v.method === 'WEBSITE')?.opted ?? true}
    size="lg"
    on:change={async (e) => {
      const method = 'WEBSITE';
      const opted = e.currentTarget.checked;

      await updateNotificationPreference({ category, method, opted });
      analytics.track('user:notification-preference:update', { category, method, opted });
    }}
  />
</div>
