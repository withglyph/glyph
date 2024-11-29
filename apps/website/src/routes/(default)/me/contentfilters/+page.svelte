<script lang="ts">
  import * as R from 'radash';
  import IconChevronRight from '~icons/tabler/chevron-right';
  import { graphql } from '$glitch';
  import { analytics } from '$lib/analytics';
  import { Helmet, Icon } from '$lib/components';
  import { Switch } from '$lib/components/forms';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import MutedSpaceModal from './MutedSpaceModal.svelte';
  import MutedTagModal from './MutedTagModal.svelte';

  let mutedSpaceOpen = false;
  let mutedTagOpen = false;

  $: query = graphql(`
    query MeContentFiltersPage_Query {
      auth(scope: USER)

      me @_required {
        id

        contentFilterPreferences {
          id
          category
          action
        }

        ...MeContentFiltersPage_MutedSpaceModal_user
        ...MeContentFiltersPage_MutedTagModal_user
      }
    }
  `);

  const updateUserContentFilterPreference = graphql(`
    mutation MeContentFiltersPage_UpdateUserContentFilterPreference_Mutation(
      $input: UpdateUserContentFilterPreferenceInput!
    ) {
      updateUserContentFilterPreference(input: $input) {
        id

        contentFilterPreferences {
          id
          category
          action
        }
      }
    }
  `);

  $: preferences = R.objectify(
    $query.me.contentFilterPreferences,
    (v) => v.category,
    (v) => v.action,
  );
</script>

<Helmet description="보고 싶은 컨텐츠와 보고 싶지 않은 컨텐츠를 설정할 수 있어요" title="뮤트/쿠션 설정" />

<h1 class={css({ fontSize: '24px', fontWeight: 'bold', hideBelow: 'sm' })}>뮤트/쿠션</h1>

<div class={css({ marginTop: { base: '20px', sm: '32px' }, smDown: { paddingX: '20px' } })}>
  <button class={css({ textAlign: 'left', width: 'full' })} type="button" on:click={() => (mutedSpaceOpen = true)}>
    <div class={flex({ align: 'center', gap: '4px', marginBottom: '4px' })}>
      <h2 class={css({ fontSize: { base: '16px', sm: '18px' }, fontWeight: 'semibold' })}>뮤트한 스페이스</h2>
      <Icon icon={IconChevronRight} />
    </div>
    <p class={css({ fontSize: '13px', color: 'gray.500' })}>
      스페이스를 뮤트할 경우 해당 스페이스의 포스트가 보이지 않아요.
    </p>
  </button>

  <button
    class={css({ marginY: '60px', textAlign: 'left', width: 'full' })}
    type="button"
    on:click={() => (mutedTagOpen = true)}
  >
    <div class={flex({ align: 'center', gap: '4px', marginBottom: '4px' })}>
      <h2 class={css({ fontSize: { base: '16px', sm: '18px' }, fontWeight: 'semibold' })}>뮤트한 태그</h2>
      <Icon icon={IconChevronRight} />
    </div>
    <p class={css({ fontSize: '13px', color: 'gray.500' })}>
      태그를 뮤트할 경우 해당 태그가 들어있는 포스트 및 태그가 보이지 않아요.
    </p>
  </button>

  <div class={flex({ align: 'center', justify: 'space-between', gap: '20px' })}>
    <div>
      <p class={css({ marginBottom: '4px', fontSize: { base: '16px', sm: '18px' }, fontWeight: 'semibold' })}>
        성인물 쿠션 활성화
      </p>
      <p class={css({ fontSize: '13px', color: 'gray.500' })}>
        성인물 쿠션을 활성화할 경우 읽기 전 경고 메시지가 나타나요.
      </p>
    </div>

    <Switch
      checked={preferences.ADULT === 'WARN'}
      on:change={async (e) => {
        const category = 'ADULT';
        const action = e.currentTarget.checked ? 'WARN' : 'EXPOSE';

        await updateUserContentFilterPreference({ category, action });
        analytics.track('user:content-filter-preference:update', { category, action });
      }}
    />
  </div>
</div>

<MutedSpaceModal $user={$query.me} bind:open={mutedSpaceOpen} />
<MutedTagModal $user={$query.me} bind:open={mutedTagOpen} />
