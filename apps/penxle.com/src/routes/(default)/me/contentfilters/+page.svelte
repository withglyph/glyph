<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import clsx from 'clsx';
  import * as R from 'radash';
  import { graphql } from '$glitch';
  import { Switch } from '$lib/components/forms';
  import ContentFilterButton from './ContentFilterButton.svelte';

  let isOpen = true;

  $: query = graphql(`
    query MeContentFiltersPage_Query {
      me @_required {
        id

        contentFilterPreferences {
          id
          category
          action
        }

        ...MeContentFiltersPage_ContentFilterButton_user
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

<Helmet title="필터링 설정" />

<h2 class="text-xl font-bold mb-6 <sm:hidden">필터링 설정</h2>
<div class="bg-white py-8 px-6 space-y-8 text-3.75 sm:(px-8 border border-gray-30 rounded-2xl)">
  <div class="flex flex-col flex-wrap justify-center justify-between">
    <div class="flex items-center justify-between w-full mb-4">
      <button type="button">
        <h3 class="text-lg font-extrabold">안보기 처리한 스페이스</h3>
      </button>
      <button type="button">
        <span class="i-lc-chevron-right square-6" />
      </button>
    </div>
    <p class="text-3.75 text-gray-50">
      스페이스를 안보기 할 경우 해당 스페이스가 올린 포스트는 내 피드에 올라오지 않습니다.
    </p>
    <p class="text-3.75 text-gray-50">
      위 기능은 스페이스에만 귀속되므로 안보기 처리한 스페이스의 멤버가 다른 스페이스에서 올린 글은 노출될 수 있습니다.
    </p>
  </div>

  <div class="w-full border-b border-alphagray-15" />

  <div class="flex flex-col flex-wrap justify-center justify-between">
    <div class="flex items-center justify-between w-full mb-4">
      <button type="button">
        <h3 class="text-lg font-extrabold">안보기 처리한 태그</h3>
      </button>
      <button type="button">
        <span class="i-lc-chevron-right square-6" />
      </button>
    </div>
    <p class="text-3.75 text-gray-50">
      태그를 안보기 처리할 경우 해당 태그가 속해있는 포스트가 내 피드에 보이지 않습니다.
    </p>
    <p class="text-3.75 text-gray-50">
      다른 태그를 포함하였더라도 안보기 처리한 태그가 함께 포함되어있는 포스트는 내 피드에 노출되지 않습니다.
    </p>
  </div>

  <div class="w-full border-b border-alphagray-15" />

  <div class="flex flex-col flex-wrap justify-center justify-between">
    <div class="flex items-center justify-between w-full mb-4">
      <button type="button">
        <h3 class="text-lg font-extrabold">민감한 내용(주의요소) 표시</h3>
      </button>

      <Switch
        checked={preferences.TRIGGER !== 'HIDE'}
        on:change={async (e) => {
          await updateUserContentFilterPreference({
            category: 'TRIGGER',
            action: e.currentTarget.checked ? 'WARN' : 'HIDE',
          });
        }}
      />
    </div>

    <p class="text-3.75 text-gray-50">
      포스트를 올릴 때 설정한 트리거 태그(유혈, 폭력 등) 여부에 대해 체크한 포스팅이 노출되지 않습니다.
    </p>

    {#if preferences.TRIGGER !== 'HIDE'}
      <div class="flex items-center gap-3 my-4">
        <p class="text-3.75 font-bold">민감한 내용 사전 블러 처리</p>

        <Switch
          checked={preferences.TRIGGER !== 'EXPOSE'}
          size="sm"
          on:change={async (e) => {
            await updateUserContentFilterPreference({
              category: 'TRIGGER',
              action: e.currentTarget.checked ? 'WARN' : 'EXPOSE',
            });
          }}
        />
      </div>

      <button
        class="text-gray-50 flex items-center gap-1 mb-4 w-fit"
        type="button"
        on:click={() => {
          isOpen = !isOpen;
        }}
      >
        <span class="text-3.25 font-bold">표시될 트리거워닝 세부 설정</span>
        <span class={clsx('i-lc-chevron-down square-3.5 transition', !isOpen && 'rotate-180')} />
      </button>

      {#if isOpen}
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
      {/if}
    {/if}
  </div>

  <div class="w-full border-b border-alphagray-15" />

  <div class="flex flex-col flex-wrap justify-center justify-between">
    <div class="flex items-center justify-between w-full mb-4">
      <button type="button">
        <h3 class="text-lg font-extrabold">성인물 표시</h3>
      </button>

      <Switch
        checked={preferences.ADULT !== 'HIDE'}
        on:change={async (e) => {
          await updateUserContentFilterPreference({
            category: 'ADULT',
            action: e.currentTarget.checked ? 'WARN' : 'HIDE',
          });
        }}
      />
    </div>

    <p class="text-3.75 text-gray-50">성인물에 해당하는 요소가 포함된 포스트가 노출되지 않습니다.</p>

    {#if preferences.ADULT !== 'HIDE'}
      <div class="flex items-center gap-3 my-4">
        <p class="text-3.75 font-bold">성인물 블러 처리</p>

        <Switch
          checked={preferences.ADULT !== 'EXPOSE'}
          size="sm"
          on:change={async (e) => {
            await updateUserContentFilterPreference({
              category: 'ADULT',
              action: e.currentTarget.checked ? 'WARN' : 'EXPOSE',
            });
          }}
        />
      </div>
    {/if}
  </div>
</div>
