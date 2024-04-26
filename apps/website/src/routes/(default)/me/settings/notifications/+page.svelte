<script lang="ts">
  import { graphql } from '$glitch';
  import { Helmet } from '$lib/components';
  import { flex } from '$styled-system/patterns';
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
</script>

<Helmet description="받을 알림을 설정할 수 있어요" title="알림 설정" />

<div class={flex({ direction: 'column', gap: '40px' })}>
  <NotificationSwitch
    $user={$query.me}
    category="COMMENT"
    description="포스트에 댓글 및 답글이 달렸을 때 알림을 받아요"
    title="댓글/답글"
  />

  <!-- TODO: emoji reaction-->
  <NotificationSwitch
    $user={$query.me}
    category="SUBSCRIBE"
    description="포스트에 이모지가 달렸을 때 알림을 받아요"
    title="이모지"
  />

  <NotificationSwitch
    $user={$query.me}
    category="SUBSCRIBE"
    description="스페이스 구독자가 생겼을 때 알림을 받아요"
    title="스페이스 구독"
  />

  <NotificationSwitch
    $user={$query.me}
    category="PURCHASE"
    description="포스트 구매 및 후원이 이루어졌을 때 알림을 받아요"
    title="구매/후원"
  />
</div>
