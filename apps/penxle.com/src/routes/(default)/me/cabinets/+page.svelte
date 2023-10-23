<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import FollowSpaceModal from './FollowSpaceModal.svelte';

  let followingSpaceOpen = false;

  $: query = graphql(`
    query MeCabinetsPage_Query {
      auth(scope: USER)

      me @_required {
        id

        followedSpaces {
          id
        }

        ...MeCabinetsPage_FollowSpaceModal_user
      }
    }
  `);
</script>

<Helmet title="나의 서랍" />

<h1 class="title-20-eb mb-6 <sm:hidden">나의 서랍</h1>

<div class="space-y-2 sm:space-y-6">
  <div class="bg-white flex py-3 sm:(border border-secondary rounded-2xl)">
    <button
      class="flex flex-col center grow basis-0 border-r"
      type="button"
      on:click={() => (followingSpaceOpen = true)}
    >
      <div class="title-20-eb mb-2 sm:title-24-eb">{$query.me.followedSpaces.length}</div>
      <div class="body-13-m text-secondary sm:body-16-m">관심 스페이스</div>
    </button>
    <div class="flex flex-col center grow basis-0">
      <div class="title-20-eb mb-2 sm:title-24-eb">29</div>
      <div class="body-13-m text-secondary sm:body-16-m">관심 태그</div>
    </div>
    <div class="flex flex-col center grow basis-0">
      <div class="title-20-eb mb-2 sm:title-24-eb">300</div>
      <div class="body-13-m text-secondary sm:body-16-m">관심 그룹</div>
    </div>
  </div>
</div>

<FollowSpaceModal $user={$query.me} bind:open={followingSpaceOpen} />
