<script lang="ts">
  import { graphql } from '$glitch';
  import { Switch } from '$lib/components/forms';
  import { toast } from '$lib/notification';
  import type { UserNotificationCategory } from '$glitch/gql';

  export let name: string;
  export let content: string;
  export let website: boolean;
  export let email: boolean;
  export let all: { website: boolean; email: boolean };

  const updateNotificationPreferences = graphql(`
    mutation MeNotificationsPage_Notification_UpdateNotificationPreferences_Mutation(
      $input: UpdateNotificationPreferencesInput!
    ) {
      updateNotificationPreferences(input: $input)
    }
  `);

  const category = {
    '전체': 'ALL',
    '댓글': 'COMMENT',
    '답글': 'REPLY',
    '스페이스 구독': 'SUBSCRIBE',
    '태그 수정': 'TAG_EDIT',
    '조회수': 'TREND',
    '구매': 'PURCHASE',
    '후원': 'DONATE',
    '태그 위키 수정': 'TAG_WIKI_EDIT',
  }[name] as UserNotificationCategory;
</script>

<div class="flex flex-col flex-wrap justify-center sm:(flex-row items-center justify-between flex-nowrap)">
  <div class="flex items-center justify-between py-4 px-6 sm:p-0">
    <div>
      <div class="text-lg font-extrabold">{name}</div>
      <p class="text-3.75 text-gray-50">
        {content}
      </p>
    </div>
    <button class="i-lc-chevron-down sm:hidden" type="button" />
  </div>
  <div class="flex flex-col bg-gray-10 py-4 px-6 space-y-6 sm:(space-y-0 flex-row items-center p-0 bg-white gap-8)">
    <div class="flex justify-between items-center">
      <span class="font-semibold sm:hidden">웹사이트</span>
      <Switch
        class="sm:hidden"
        disabled={!all.website}
        size="sm"
        bind:checked={website}
        on:change={async () => {
          try {
            await updateNotificationPreferences({
              category,
              isEnabled: !website,
              method: 'WEBSITE',
            });
            toast.success('알림 설정이 변경되었어요.');
          } catch {
            toast.error('알림 설정 변경에 실패했어요.');
          }
        }}
      />
      <Switch
        class="<sm:hidden"
        disabled={!all.website}
        size="lg"
        bind:checked={website}
        on:change={async () => {
          try {
            await updateNotificationPreferences({
              category,
              isEnabled: !website,
              method: 'WEBSITE',
            });
            toast.success('알림 설정이 변경되었어요.');
          } catch {
            toast.error('알림 설정 변경에 실패했어요.');
          }
        }}
      />
    </div>
    <div class="flex justify-between items-center">
      <span class="font-semibold sm:hidden">이메일</span>
      <Switch
        class="sm:hidden"
        disabled={!all.email}
        size="sm"
        bind:checked={email}
        on:change={async () => {
          try {
            await updateNotificationPreferences({
              category,
              isEnabled: !email,
              method: 'EMAIL',
            });
            toast.success('알림 설정이 변경되었어요.');
          } catch {
            toast.error('알림 설정 변경에 실패했어요.');
          }
        }}
      />
      <Switch
        class="<sm:hidden"
        disabled={!all.email}
        size="lg"
        bind:checked={email}
        on:change={async () => {
          try {
            await updateNotificationPreferences({
              category,
              isEnabled: !email,
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
</div>
