<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import { Switch } from '$lib/components/forms';
  import { toast } from '$lib/notification';
  import Notification from './Notification.svelte';

  $: query = graphql(`
    query MeNotificationsPage_Query {
      me @_required {
        id

        all: notificationPreferences(category: ALL) {
          email
          website
        }

        comment: notificationPreferences(category: COMMENT) {
          email
          website
        }

        reply: notificationPreferences(category: REPLY) {
          email
          website
        }

        subscribe: notificationPreferences(category: SUBSCRIBE) {
          email
          website
        }

        tagEdit: notificationPreferences(category: TAG_EDIT) {
          email
          website
        }

        trend: notificationPreferences(category: TREND) {
          email
          website
        }

        purchase: notificationPreferences(category: PURCHASE) {
          email
          website
        }

        donate: notificationPreferences(category: DONATE) {
          email
          website
        }

        tagWikiEdit: notificationPreferences(category: TAG_WIKI_EDIT) {
          email
          website
        }
      }
    }
  `);

  const updateNotificationPreferences = graphql(`
    mutation MeNotificationsPage_UpdateNotificationPreferences_Mutation(
      $input: UpdateNotificationPreferencesInput!
    ) {
      updateNotificationPreferences(input: $input)
    }
  `);
</script>

<Helmet title="알림 설정" />

<div class="w-full max-w-200">
  <h2 class="text-xl font-bold mb-6 <sm:hidden">알림 설정</h2>
  <div class="bg-white sm:(space-y-8 border border-gray-30 rounded-2xl p-8)">
    <div class="hidden justify-end gap-8 text-3.75 text-gray-50 sm:flex">
      <span>웹사이트</span>
      <span>이메일</span>
    </div>
    <div
      class="flex flex-wrap items-center justify-between gap-4 pt-14 py-4 px-6 sm:p-0"
    >
      <div class="text-lg font-extrabold">알림 켜기 / 끄기</div>
      <Switch
        class="sm:hidden"
        checked={$query.me.all.email || $query.me.all.website}
        on:change={async () => {
          try {
            await updateNotificationPreferences({
              category: 'ALL',
              isEnabled: !($query.me.all.email || $query.me.all.website),
              method: 'WEBSITE',
            });
            await updateNotificationPreferences({
              category: 'ALL',
              isEnabled: !($query.me.all.email || $query.me.all.website),
              method: 'EMAIL',
            });
            toast.success('알림 설정이 변경되었어요.');
          } catch {
            toast.error('알림 설정 변경에 실패했어요.');
          }
        }}
      />
      <div class="hidden sm:(flex gap-8)">
        <Switch
          checked={$query.me.all.website}
          on:change={async () => {
            try {
              await updateNotificationPreferences({
                category: 'ALL',
                isEnabled: !$query.me.all.website,
                method: 'WEBSITE',
              });
              toast.success('알림 설정이 변경되었어요.');
            } catch {
              toast.error('알림 설정 변경에 실패했어요.');
            }
          }}
        />
        <Switch
          checked={$query.me.all.email}
          on:change={async () => {
            try {
              await updateNotificationPreferences({
                category: 'ALL',
                isEnabled: !$query.me.all.email,
                method: 'EMAIL',
              });
              toast.success('알림 설정이 변경되었어요.');
            } catch {
              toast.error('알림 설정 변경에 실패했어요.');
            }
          }}
        />
      </div>
    </div>

    <Notification
      name="댓글"
      all={$query.me.all}
      content="내 포스트에 댓글이 달렸을 때 알림을 받아요."
      email={$query.me.comment.email}
      website={$query.me.comment.website}
    />

    <Notification
      name="답글"
      all={$query.me.all}
      content="댓글에 답글이 달렸을 때 알림을 받아요."
      email={$query.me.reply.email}
      website={$query.me.reply.website}
    />

    <Notification
      name="스페이스 구독"
      all={$query.me.all}
      content="스페이스 구독자가 생겼을 때 알림을 받아요."
      email={$query.me.subscribe.email}
      website={$query.me.subscribe.website}
    />

    <Notification
      name="태그 수정"
      all={$query.me.all}
      content="내 포스트 태그를 수정했을 때 알림을 받아요."
      email={$query.me.tagEdit.email}
      website={$query.me.tagEdit.website}
    />

    <Notification
      name="조회수"
      all={$query.me.all}
      content="조회수가 급상승했을 때 알림을 받아요."
      email={$query.me.trend.email}
      website={$query.me.trend.website}
    />

    <Notification
      name="구매"
      all={$query.me.all}
      content="내 포스트가 구매됐을 때 알림을 받아요."
      email={$query.me.purchase.email}
      website={$query.me.purchase.website}
    />

    <Notification
      name="후원"
      all={$query.me.all}
      content="내 포스트에 후원을 받았을 때 알림을 받아요."
      email={$query.me.donate.email}
      website={$query.me.donate.website}
    />

    <Notification
      name="태그 위키 수정"
      all={$query.me.all}
      content="내가 작성한 태그가 수정됐을 때 알림을 받아요."
      email={$query.me.tagWikiEdit.email}
      website={$query.me.tagWikiEdit.website}
    />
  </div>
</div>
