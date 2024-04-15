<script lang="ts">
  import * as R from 'radash';
  import IconChevronRight from '~icons/tabler/chevron-right';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Helmet, Icon } from '$lib/components';
  import { Switch } from '$lib/components/forms';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import MutedSpaceModal from './MutedSpaceModal.svelte';
  import MutedTagModal from './MutedTagModal.svelte';

  let mutedSpaceOpen = false;
  let mutedTagOpen = false;

  $: query = graphql(`
    query MeSettingsContentFiltersPage_Query {
      auth(scope: USER)

      me @_required {
        id

        contentFilterPreferences {
          id
          category
          action
        }

        ...MeSettingsContentFiltersPage_MutedSpaceModal_user
        ...MeSettingsContentFiltersPage_MutedTagModal_user
      }
    }
  `);

  const updateUserContentFilterPreference = graphql(`
    mutation MeSettingsContentFiltersPage_UpdateUserContentFilterPreference_Mutation(
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

<Helmet description="보고 싶은 컨텐츠와 보고 싶지 않은 컨텐츠를 설정할 수 있어요" title="필터링 설정" />

<div class={flex({ direction: 'column', gap: '32px', paddingX: { base: '24px', sm: '32px' }, paddingY: '32px' })}>
  <button class={css({ textAlign: 'left' })} type="button" on:click={() => (mutedSpaceOpen = true)}>
    <div class={flex({ align: 'center', gap: '4px', marginBottom: '8px', width: 'full' })}>
      <h3 class={css({ fontSize: '18px', fontWeight: 'bold' })}>숨긴 스페이스</h3>
      <Icon style={css.raw({ color: 'gray.500' })} icon={IconChevronRight} size={24} />
    </div>
    <p class={css({ color: 'gray.500' })}>
      스페이스를 숨기기 할 경우 해당 스페이스가 올린 포스트가 사이트에서 보이지 않아요.
    </p>
    <p class={css({ color: 'gray.500' })}>
      위 기능은 스페이스에만 귀속되므로 숨긴 스페이스의 멤버가 다른 스페이스에서 올린 글은 노출될 수 있어요.
    </p>
  </button>

  <hr class={css({ borderStyle: 'none', backgroundColor: 'gray.200', height: '1px' })} />

  <button class={css({ textAlign: 'left' })} type="button" on:click={() => (mutedTagOpen = true)}>
    <div class={flex({ align: 'center', gap: '4px', marginBottom: '8px', width: 'full' })}>
      <h3 class={css({ fontSize: '18px', fontWeight: 'bold' })}>숨긴 태그</h3>
      <Icon style={css.raw({ color: 'gray.500' })} icon={IconChevronRight} size={24} />
    </div>
    <p class={css({ color: 'gray.500' })}>
      태그를 숨기기 처리할 경우 해당 태그가 속해있는 포스트가 사이트에서 보이지 않아요.
    </p>
    <p class={css({ color: 'gray.500' })}>
      다른 태그를 포함하였더라도 숨긴 태그가 함께 포함되어 있는 포스트는 보이지 않으니 주의해주세요.
    </p>
  </button>

  <hr class={css({ borderStyle: 'none', backgroundColor: 'gray.200', height: '1px' })} />

  <div class={flex({ direction: 'column', wrap: 'wrap' })}>
    <div class={flex({ align: 'center', justify: 'space-between', marginBottom: '8px', width: 'full' })}>
      <h3 class={css({ fontSize: '18px', fontWeight: 'bold' })}>성인물 쿠션 비활성화</h3>

      <Switch
        checked={preferences.ADULT === 'EXPOSE'}
        on:change={async (e) => {
          const category = 'ADULT';
          const action = e.currentTarget.checked ? 'EXPOSE' : 'WARN';

          await updateUserContentFilterPreference({ category, action });
          mixpanel.track('user:content-filter-preference:update', { category, action });
        }}
      />
    </div>

    <p class={css({ color: 'gray.500' })}>
      성인물로 설정되어 있는 포스트는 기본적으로 읽기 전 경고 메시지가 보여져요.
      <br />
      이 옵션을 활성화할 경우 성인물 경고 메시지가 더 이상 뜨지 않아요.
    </p>
  </div>
</div>

<MutedSpaceModal $user={$query.me} bind:open={mutedSpaceOpen} />
<MutedTagModal $user={$query.me} bind:open={mutedTagOpen} />
