<script lang="ts">
  import dayjs from 'dayjs';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { TabHead, TabHeadItem } from '$lib/components/tab';
  import { pageSubTitle } from '$lib/stores';

  onMount(async () => {
    pageSubTitle.set('독자 관리');
  });

  $: query = graphql(`
    query SpaceDashboardSubscribersBlockedPage_Query($slug: String!) {
      space(slug: $slug) {
        id

        blockedMasquerades {
          id
          blockedAt

          profile {
            id
            name
          }
        }
      }
    }
  `);

  const unblockMasquerade = graphql(`
    mutation SpaceDashboardSubscribersBlockedPage_UnblockMasquerade_Mutation($input: UnblockMasqueradeInput!) {
      unblockMasquerade(input: $input) {
        id

        blockedMasquerades {
          id
        }
      }
    }
  `);
</script>

<h1 class="sm:(title-20-eb mb-6) <sm:hidden">독자 관리</h1>

<div class="<sm:bg-white">
  <TabHead class="border-none mb-6" variant="secondary">
    <TabHeadItem id={0} pathname="/{$page.params.space}/dashboard/subscribers/blocked">차단 계정</TabHeadItem>
  </TabHead>
</div>

{#if $query.space.blockedMasquerades.length === 0}
  <div class="flex flex-col gap-1 center grow my-30">
    <i class="i-tb-alert-triangle square-7 block" />
    <p class="text-center my-auto text-16-sb">차단 유저가 없어요</p>
  </div>
{:else}
  <section class="flex flex-col gap-4 p-4 rounded-xl bg-white sm:p-6 <sm:(my-5 mx-4)">
    <table class="border-spacing-0">
      <thead>
        <tr class="bg-gray-50 text-14-sb">
          <th class="py-2 pl-5 lg:w-120px <sm:hidden">
            <button class="flex items-center gap-1" type="button">
              차단일자
              <i class="i-tb-selector square-3.5" />
            </button>
          </th>
          <th class="py-2 px-2.5 text-left">아이디(익명)</th>
          <th class="py-2" />
        </tr>
      </thead>
      <tbody>
        {#each $query.space.blockedMasquerades as masquerade (masquerade.id)}
          <tr>
            <td class="border-t border-gray-200 text-14-r text-gray-600 pl-5 <sm:hidden">
              {dayjs(masquerade.blockedAt).formatAsDate()}
            </td>
            <td class="text-14-r py-3 px-2.5 border-t border-gray-200 text-gray-600">{masquerade.profile.name}</td>
            <td class="py-3 pr-1.5 border-t border-gray-200 text-right">
              <button
                class="text-11-sb text-error-900 py-1.5 px-3.5 rounded hover:bg-gray-50"
                type="button"
                on:click={async () => {
                  await unblockMasquerade({ spaceId: $query.space.id, masqueradeId: masquerade.id });
                  mixpanel.track('unblock:masquerade', { masqueradeId: masquerade.id, spaceId: $query.space.id });
                }}
              >
                차단해제
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>
{/if}
