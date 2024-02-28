<script lang="ts">
  import * as R from 'radash';
  import IconChevronDown from '~icons/tabler/chevron-down';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Icon } from '$lib/components';
  import { Switch } from '$lib/components/forms';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { MeSettingsNotificationsPage_Notification_user, UserNotificationCategory } from '$glitch';

  let _user: MeSettingsNotificationsPage_Notification_user;
  export { _user as $user };
  export let title: string;
  export let description: string;
  export let category: UserNotificationCategory;
  let open = false;

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
    direction: { base: 'column', sm: 'row' },
    wrap: { base: 'wrap', sm: 'nowrap' },
    align: { sm: 'center' },
    justify: { base: 'center', sm: 'space-between' },
  })}
>
  <button
    class={flex({ align: 'center', justify: 'space-between', paddingX: '24px', paddingY: '16px', hideFrom: 'sm' })}
    type="button"
    on:click={() => (open = !open)}
  >
    <div>
      <div class={css({ fontSize: '18px', fontWeight: 'bold', textAlign: 'left' })}>{title}</div>
      <p class={css({ fontSize: '15px', color: 'gray.500', textAlign: 'left' })}>
        {description}
      </p>
    </div>
    <Icon style={css.raw(open && { transform: 'rotate(180deg)' })} icon={IconChevronDown} />
  </button>
  <div class={flex({ direction: 'column', justify: 'center', hideBelow: 'sm' })}>
    <div class={css({ fontSize: '18px', fontWeight: 'bold' })}>{title}</div>
    <p class={css({ fontSize: '15px', color: 'gray.500' })}>
      {description}
    </p>
  </div>
  {#if open}
    <div
      class={flex({
        direction: 'column',
        gap: '24px',
        paddingX: '24px',
        paddingY: '16px',
        backgroundColor: 'gray.50',
        hideFrom: 'sm',
      })}
    >
      <div class={flex({ align: 'center', justify: 'space-between' })}>
        <span class={css({ fontWeight: 'semibold' })}>웹사이트</span>
        <Switch
          checked={preferences[category]?.find((v) => v.method === 'WEBSITE')?.opted ?? true}
          disabled={preferences.ALL?.find((v) => v.method === 'WEBSITE')?.opted === false}
          size="sm"
          on:change={async (e) => {
            const method = 'WEBSITE';
            const opted = e.currentTarget.checked;

            await updateNotificationPreference({ category, method, opted });
            mixpanel.track('user:notification-preference:update', { category, method, opted });
          }}
        />
      </div>

      <div class={flex({ align: 'center', justify: 'space-between' })}>
        <span class={css({ fontWeight: 'semibold' })}>이메일</span>
        <Switch
          checked={preferences[category]?.find((v) => v.method === 'EMAIL')?.opted ?? true}
          disabled={preferences.ALL?.find((v) => v.method === 'EMAIL')?.opted === false}
          size="sm"
          on:change={async (e) => {
            const method = 'EMAIL';
            const opted = e.currentTarget.checked;

            await updateNotificationPreference({ category, method, opted });
            mixpanel.track('user:notification-preference:update', { category, method, opted });
          }}
        />
      </div>
    </div>
  {/if}
  <div class={flex({ align: 'center', gap: '32px', backgroundColor: 'white', hideBelow: 'sm' })}>
    <Switch
      checked={preferences[category]?.find((v) => v.method === 'WEBSITE')?.opted ?? true}
      disabled={preferences.ALL?.find((v) => v.method === 'WEBSITE')?.opted === false}
      size="lg"
      on:change={async (e) => {
        const method = 'WEBSITE';
        const opted = e.currentTarget.checked;

        await updateNotificationPreference({ category, method, opted });
        mixpanel.track('user:notification-preference:update', { category, method, opted });
      }}
    />

    <Switch
      checked={preferences[category]?.find((v) => v.method === 'EMAIL')?.opted ?? true}
      disabled={preferences.ALL?.find((v) => v.method === 'EMAIL')?.opted === false}
      size="lg"
      on:change={async (e) => {
        const method = 'EMAIL';
        const opted = e.currentTarget.checked;

        await updateNotificationPreference({ category, method, opted });
        mixpanel.track('user:notification-preference:update', { category, method, opted });
      }}
    />
  </div>
</div>
