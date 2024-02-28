<script lang="ts">
  import clsx from 'clsx';
  import IconEffit from '~icons/effit/effit';
  import IconStamp from '~icons/effit/stamp';
  import IconChevronRight from '~icons/tabler/chevron-right';
  import { goto } from '$app/navigation';
  import ImageBanner from '$assets/images/event-202402.png';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Icon } from '$lib/components';
  import LoginRequireModal from '../../LoginRequireModal.svelte';

  let open = false;

  $: query = graphql(`
    query EventsPage_Query {
      me {
        id

        post_publish: eventEnrollment(eventCode: "post_publish_202402") {
          id
          eventCode
          eligible
        }

        twitter_spacelink: eventEnrollment(eventCode: "twitter_spacelink_2024") {
          id
          eventCode
          eligible
        }

        singleSignOns {
          id
          provider
        }
      }
    }
  `);

  const createPost = graphql(`
    mutation EventsPage_CreatePost_Mutation($input: CreatePostInput!) {
      createPost(input: $input) {
        id
        permalink
      }
    }
  `);

  const issueUserSingleSignOnAuthorizationUrl = graphql(`
    mutation EventsPage_UserSingleSignOn_IssueUserSingleSignOnAuthorizationUrl_Mutation(
      $input: IssueUserSingleSignOnAuthorizationUrlInput!
    ) {
      issueUserSingleSignOnAuthorizationUrl(input: $input) {
        url
      }
    }
  `);
</script>

<div class="pb-5 bg-white w-full max-w-300 sm:pb-15">
  <img class="pb-5 sm:pb-15" alt="events-2024-02-banner" src={ImageBanner} />
  <p class="text-14-r mb-1 px-5 sm:(px-15 text-18-r mb-3)">
    포스트 2회 이상 업로드 <mark class="text-teal-500">2000P</mark>
    <br />
    트위터 연동 및 프로필 링크 게시
    <mark class="text-teal-500">+2000P</mark>
  </p>
  <p class="text-gray-400 text-11-r px-5 sm:(px-15 text-14-r)">
    트위터 연동 시에는 펜슬 링크가 필요하며,
    <br />
    이미 연동되어 있는 경우에는 다시 한 번 연동해주세요
  </p>

  <div class="mt-4 max-w-150 mx-auto text-center <sm:px-5 sm:mt-20">
    <div class="border border-gray-200 rounded-md px-4 pt-3.5 pb-6 space-y-6 bg-gray-50 sm:p-6">
      <h2 class="text-14-r text-gray-500 text-left sm:text-18-r">이벤트 현황</h2>

      <div class="flex center gap-4 sm:gap-10">
        <div>
          <div class="relative mx-auto square-22 sm:square-26">
            <Icon class="text-gray-200 square-full" icon={IconEffit} />
            {#if $query.me?.post_publish?.eligible}
              <Icon class="square-full absolute left-0 top-0 flex center" icon={IconStamp} />
              <span class="text-error-900 text-14-b -rotate-8">2000P</span>
            {/if}
          </div>
          <p
            class={clsx(
              'text-13-m text-center mt-1 sm:text-16-m',
              !$query.me?.post_publish?.eligible && 'text-gray-400',
            )}
          >
            포스트 2회 이상
          </p>
        </div>

        <div>
          <div class="relative mx-auto square-22 sm:square-26">
            <Icon class="text-gray-200 square-full" icon={IconEffit} />
            {#if $query.me?.twitter_spacelink?.eligible}
              <Icon class="square-full absolute left-0 top-0 flex center" icon={IconStamp} />
              <span class="text-error-900 text-14-b -rotate-8">+2000P</span>
            {/if}
          </div>
          <p
            class={clsx(
              'text-13-m text-center mt-1 sm:text-16-m',
              !$query.me?.twitter_spacelink?.eligible && 'text-gray-400',
            )}
          >
            트위터 프로필 링크
          </p>
        </div>
      </div>
    </div>

    <button
      class="px-4 py-2.5 rounded-md border border-teal-500 bg-teal-500 text-white text-16-sb text-gray-400 text-center w-full my-4 disabled:(text-gray-300 bg-gray-50 border-gray-200) sm:mt-8"
      disabled={$query.me?.post_publish?.eligible}
      type="button"
      on:click={async () => {
        if (!$query.me) {
          open = true;
          return;
        }

        const { permalink } = await createPost({ spaceId: undefined });
        mixpanel.track('post:create', { via: 'event-202402' });
        await goto(`/editor/${permalink}`);
      }}
    >
      포스트 올리기
    </button>

    <button
      class="px-4 py-2.5 rounded-md border border-gray-200 text-16-sb text-gray-400 text-center w-full disabled:(text-gray-300 bg-gray-50)"
      disabled={$query.me?.twitter_spacelink?.eligible}
      type="button"
      on:click={async () => {
        if (!$query.me) {
          open = true;
          return;
        }

        const { url } = await issueUserSingleSignOnAuthorizationUrl({
          type: 'LINK',
          provider: 'TWITTER',
        });

        mixpanel.track('user:single-sign-on:link:start', { provider: 'TWITTER', via: 'event-202402' });
        location.href = url;
      }}
    >
      {#if $query.me?.twitter_spacelink?.eligible && $query.me?.singleSignOns.some(({ provider }) => provider === 'TWITTER')}
        트위터 재연동하기
      {:else}
        트위터 연동하기
      {/if}
    </button>

    <a class="text-14-r text-gray-600 inline-block my-14.5 mx-auto" href="/penxle/736143117">
      이벤트 자세히보기 <Icon icon={IconChevronRight} />
    </a>
  </div>
</div>

<LoginRequireModal bind:open />
