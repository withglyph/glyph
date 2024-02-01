<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import * as R from 'radash';
  import ContentFilteringExample from '$assets/images/content-filtering-example.png';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Modal } from '$lib/components';
  import { Switch } from '$lib/components/forms';
  // import ContentFilterButton from './ContentFilterButton.svelte';
  import MutedSpaceModal from './MutedSpaceModal.svelte';
  import MutedTagModal from './MutedTagModal.svelte';

  let open = false;
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

        ...MeSettingsContentFiltersPage_ContentFilterButton_user
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

<Helmet title="필터링 설정" />

<div class="py-8 px-6 space-y-8 sm:px-8">
  <button type="button" on:click={() => (mutedSpaceOpen = true)}>
    <div class="flex items-center gap-1 w-full mb-2">
      <h3 class="text-lg font-extrabold">숨긴 스페이스</h3>
      <i class="i-lc-chevron-right square-6 text-secondary" />
    </div>
    <p class="text-secondary">스페이스를 숨기기 할 경우 해당 스페이스가 올린 포스트가 사이트에서 보이지 않아요.</p>
    <p class="text-secondary">
      위 기능은 스페이스에만 귀속되므로 숨긴 스페이스의 멤버가 다른 스페이스에서 올린 글은 노출될 수 있어요.
    </p>
  </button>

  <div class="w-full border-b border-alphagray-10" />

  <button type="button" on:click={() => (mutedTagOpen = true)}>
    <div class="flex items-center gap-1 w-full mb-2">
      <h3 class="text-lg font-extrabold">숨긴 태그</h3>
      <i class="i-lc-chevron-right square-6 text-secondary" />
    </div>
    <p class="text-secondary">태그를 숨기기 처리할 경우 해당 태그가 속해있는 포스트가 사이트에서 보이지 않아요.</p>
    <p class="text-secondary">
      다른 태그를 포함하였더라도 숨긴 태그가 함께 포함되어 있는 포스트는 보이지 않으니 주의해주세요.
    </p>
  </button>

  <div class="w-full border-b border-alphagray-10" />

  <div class="flex flex-col flex-wrap">
    <div class="flex items-center justify-between w-full mb-2">
      <h3 class="text-lg font-extrabold">성인물 쿠션 비활성화</h3>

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

    <p class="text-secondary">
      성인물로 설정되어 있는 포스트는 기본적으로 읽기 전 경고 메시지가 보여져요.
      <br />
      이 옵션을 활성화할 경우 성인물 경고 메시지가 더 이상 뜨지 않아요.
    </p>
  </div>

  <!-- <div class="w-full border-b border-alphagray-10" />

  <div class="flex flex-col flex-wrap">
    <div class="flex items-center justify-between w-full mb-2">
      <div class="flex items-center gap-1">
        <h3 class="text-lg font-extrabold">트리거 주의 쿠션 비활성화</h3>
        <button class="i-lc-help-circle square-4.5 text-secondary" type="button" on:click={() => (open = true)} />
      </div>
    </div>

    <p class="text-secondary mb-3">
      트리거 주의가 설정되어 있는 포스트는 기본적으로 읽기 전 경고 메시지가 보여져요.
      <br />
      아래 세부 설정을 통해 경고 메시지를 무시하고 바로 읽을 트리거 주의 목록을 설정할 수 있어요.
    </p>

    <div class="flex flex-wrap gap-3">
      <ContentFilterButton $user={$query.me} category="VIOLENCE">폭력성</ContentFilterButton>
      <ContentFilterButton $user={$query.me} category="CRUELTY">잔인성</ContentFilterButton>
      <ContentFilterButton $user={$query.me} category="HORROR">공포성</ContentFilterButton>
      <ContentFilterButton $user={$query.me} category="CRIME">약물, 범죄</ContentFilterButton>
      <ContentFilterButton $user={$query.me} category="TRAUMA">트라우마</ContentFilterButton>
      <ContentFilterButton $user={$query.me} category="GAMBLING">사행성</ContentFilterButton>
      <ContentFilterButton $user={$query.me} category="PHOBIA">정신질환, 공포증</ContentFilterButton>
      <ContentFilterButton $user={$query.me} category="INSULT">언어의 부적절성</ContentFilterButton>
      <ContentFilterButton $user={$query.me} category="GROSSNESS">벌레, 징그러움</ContentFilterButton>
      <ContentFilterButton $user={$query.me} category="OTHER">기타</ContentFilterButton>
    </div>
  </div> -->
</div>

<Modal size="md" bind:open>
  <svelte:fragment slot="title">트리거 주의가 무엇인가요?</svelte:fragment>

  <p slot="text" class="text-sm text-secondary font-semibold">
    펜슬에서는 원활한 여러분의 창작생활을 위해 다양한 정보를 찾아볼 수 있도록 하고 있어요. 하지만 유혈,폭력,왕따 등의
    누군가에게 예민할 수 있는 민감한 내용의 경우는 아래처럼 블러처리를 할 수 있어요.
  </p>

  <div class="flex center">
    <img class="my-2 max-h-83" alt="트리거 주의 블러처리 예시" src={ContentFilteringExample} />
  </div>
  <span class="text-3.25 text-secondary">트리거 주의 블러처리 예시</span>

  <Button slot="action" class="w-full" size="xl" on:click={() => (open = false)}>닫기</Button>
</Modal>

<MutedSpaceModal $user={$query.me} bind:open={mutedSpaceOpen} />
<MutedTagModal $user={$query.me} bind:open={mutedTagOpen} />
