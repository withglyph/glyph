<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import * as R from 'radash';
  import ContentFilteringExample from '$assets/images/content-filtering-example.png';
  import { graphql } from '$glitch';
  import { Button, Modal } from '$lib/components';
  import { Switch } from '$lib/components/forms';
  import ContentFilterButton from './ContentFilterButton.svelte';

  let open = false;

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
  <button type="button">
    <div class="flex items-center gap-1 w-full mb-2">
      <h3 class="text-lg font-extrabold">숨긴 스페이스</h3>
      <span class="i-lc-chevron-right square-6 text-secondary" />
    </div>
    <p class="text-secondary">스페이스를 숨기기 할 경우 해당 스페이스가 올린 포스트는 내 피드에 올라오지 않아요.</p>
    <p class="text-secondary">
      위 기능은 스페이스에만 귀속되므로 숨긴 스페이스의 멤버가 다른 스페이스에서 올린글은 노출될 수 있어요.
    </p>
  </button>

  <div class="w-full border-b border-alphagray-10" />

  <button type="button">
    <div class="flex items-center gap-1 w-full mb-2">
      <h3 class="text-lg font-extrabold">숨긴 태그</h3>
      <span class="i-lc-chevron-right square-6 text-secondary" />
    </div>
    <p class="text-secondary">태그를 숨기기 처리할 경우 해당 태그가 속해있는 포스트가 내 피드에 보이지 않아요.</p>
    <p class="text-secondary">
      다른 태그를 포함하였더라도 숨긴 태그가 함께 포함되어있는 포스트는 내 피드에 노출되지 않아요.
    </p>
  </button>

  <div class="w-full border-b border-alphagray-10" />

  <div class="flex flex-col flex-wrap">
    <div class="flex items-center justify-between w-full mb-2">
      <h3 class="text-lg font-extrabold">성인용 포스트 노출</h3>

      <Switch
        checked={preferences.ADULT === 'EXPOSE'}
        on:change={async (e) => {
          await updateUserContentFilterPreference({
            category: 'ADULT',
            action: e.currentTarget.checked ? 'EXPOSE' : 'WARN',
          });
        }}
      />
    </div>

    <p class="text-secondary">
      성인용으로 설정되어 있는 포스트를 노출할지 정할 수 있어요.
      <br />
      비활성화할 경우 성인용 포스트를 볼 때 경고가 보여져요.
    </p>
  </div>

  <div class="w-full border-b border-alphagray-10" />

  <div class="flex flex-col flex-wrap">
    <div class="flex items-center justify-between w-full mb-2">
      <div class="flex items-center gap-1">
        <h3 class="text-lg font-extrabold">트리거 태그 포스트 노출</h3>
        <button class="i-lc-help-circle square-4.5 text-secondary" type="button" on:click={() => (open = true)} />
      </div>
    </div>

    <p class="text-secondary mb-3">
      트리거 태그가 설정되어있는 포스트는 기본적으로 블러처리되어 노출돼요.
      <br />
      아래 세부 설정을 통해 경고 없이 보고싶은 포스트를 설정할 수 있어요.
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
  </div>
</div>

<Modal size="md" bind:open>
  <svelte:fragment slot="title">트리거 태그가 무엇인가요?</svelte:fragment>

  <p slot="text" class="text-sm text-secondary font-semibold">
    펜슬팀은 원활한 여러분의 창작생활을 위해 다양한 정보를 찾아볼 수 있도록 하고 있어요. 하지만 유혈,폭력,왕따 등의
    누군가에게 예민할 수 있는 민감한 내용의 경우는 아래처럼 블러처리를 할 수 있어요.
  </p>

  <div class="flex center">
    <img class="my-2 max-h-83" alt="트리거 태그 블러처리 예시" src={ContentFilteringExample} />
  </div>
  <span class="text-3.25 text-secondary">트리거 태그 블러처리 예시</span>

  <Button slot="action" class="w-full" size="xl" on:click={() => (open = false)}>닫기</Button>
</Modal>
