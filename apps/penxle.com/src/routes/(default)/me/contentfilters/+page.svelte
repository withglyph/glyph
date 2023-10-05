<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import * as R from 'radash';
  import { graphql } from '$glitch';
  import { Button, Modal, Tag } from '$lib/components';
  import { Switch } from '$lib/components/forms';
  import ContentFilterButton from './ContentFilterButton.svelte';

  let open = false;

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
        <h3 class="text-lg font-extrabold">숨긴 스페이스</h3>
      </button>
      <button type="button">
        <span class="i-lc-chevron-right square-6" />
      </button>
    </div>
    <p class="text-3.75 text-secondary">
      스페이스를 숨기기 할 경우 해당 스페이스가 올린 포스트는 내 피드에 올라오지 않아요.
    </p>
    <p class="text-3.75 text-secondary">
      위 기능은 스페이스에만 귀속되므로 숨긴 스페이스의 멤버가 다른 스페이스에서 올린글은 노출될 수 있어요.
    </p>
  </div>

  <div class="w-full border-b border-alphagray-15" />

  <div class="flex flex-col flex-wrap justify-center justify-between">
    <div class="flex items-center justify-between w-full mb-4">
      <button type="button">
        <h3 class="text-lg font-extrabold">숨긴 태그</h3>
      </button>
      <button type="button">
        <span class="i-lc-chevron-right square-6" />
      </button>
    </div>
    <p class="text-3.75 text-secondary">
      태그를 숨기기 처리할 경우 해당 태그가 속해있는 포스트가 내 피드에 보이지 않아요.
    </p>
    <p class="text-3.75 text-secondary">
      다른 태그를 포함하였더라도 숨긴 태그가 함께 포함되어있는 포스트는 내 피드에 노출되지 않아요.
    </p>
  </div>

  <div class="w-full border-b border-alphagray-15" />

  <div class="flex flex-col flex-wrap justify-center justify-between">
    <div class="flex items-center justify-between w-full mb-4">
      <h3 class="text-lg font-extrabold">성인용 포스트 노출</h3>

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

    <p class="text-3.75 text-secondary">
      성인용으로 설정되어 있는 포스트를 노출할지 정할 수 있어요.
      <br />
      비활성화할 경우 메인 피드, 검색 결과, 포스트 상세 페이지 등 사이트에서 성인용 포스트가 보이지 않아요.
    </p>

    {#if preferences.ADULT !== 'HIDE'}
      <div class="flex items-center gap-3 mt-4">
        <p class="text-3.75 font-bold">열람 전 경고 절차 거치기</p>

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

  <div class="w-full border-b border-alphagray-15" />

  <div class="flex flex-col flex-wrap justify-center justify-between">
    <div class="flex items-center justify-between w-full mb-4">
      <div class="flex items-center gap-1">
        <h3 class="text-lg font-extrabold">트리거 태그 포스트 노출</h3>
        <button class="i-lc-help-circle square-4.5 text-secondary" type="button" on:click={() => (open = true)} />
      </div>

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

    <p class="text-3.75 text-secondary">
      트리거 태그가 설정되어 있는 포스트를 노출할지 정할 수 있어요.
      <br />
      비활성화할 경우 메인 피드, 검색 결과, 포스트 상세 페이지 등 사이트에서 트리거 태그 포스트가 보이지 않아요.
    </p>

    {#if preferences.TRIGGER !== 'HIDE'}
      <div class="flex items-center gap-3 my-4">
        <p class="text-3.75 font-bold">열람 전 경고 절차 거치기</p>

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

      <p class="mb-1 text-secondary text-3.25 font-bold">노출할 트리거 태그 선택</p>
      <p class="mb-3 text-secondary text-3.25">
        기본적으로 모든 트리거 태그가 노출되지만, 아래에서 보고 싶지 않은 트리거 태그의 선택을 해제해 해당 태그에 한해
        노출되지 않도록 할 수 있어요.
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
    {/if}
  </div>
</div>

<Modal size="md" bind:open>
  <svelte:fragment slot="title">트리거 태그가 무엇인가요?</svelte:fragment>

  <p slot="text" class="text-sm text-secondary">
    펜슬팀은 원활한 여러분의 창작생활을 위해 다양한 정보를 찾아볼 수 있도록 하고 있어요. 하지만 유혈,폭력,왕따 등의
    누군가에게 예민할 수 있는 민감한 내용의 경우는 아래처럼 블러처리를 하거나 아예 안볼 수 있어요.
  </p>

  <div class="my-2 border rounded-2xl border-secondary py-6 px-4 my-2">
    <p class="text-lg font-extrabold mb-2">민감한 내용의 게시글</p>
    <p class="text-secondary">시청에 주의가 필요한 글이에요.</p>

    <!-- 예시 이미지 넣기-->
    <div class="bg-gray-50 my-4 h-45 text-gray-5 flex flex-col center gap-2.5 rounded-lg backdrop-blur">
      <span class="i-lc-alert-triangle square-6" />
      <span>이 글은 시청에 주의가 필요한 글이에요</span>
    </div>
    <Tag size="sm">#유혈</Tag>
    <Tag size="sm">#폭력</Tag>
    <Tag size="sm">#소설</Tag>
  </div>

  <span class="text-3.25 text-secondary">트리거 태그 블러처리 예시</span>

  <Button slot="action" class="w-full" size="xl">닫기</Button>
</Modal>
