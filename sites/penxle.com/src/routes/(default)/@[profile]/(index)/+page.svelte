<script lang="ts">
  import { page } from '$app/stores';
  import { Avatar, Button, Helmet, Link } from '$lib/components';
  import { graphql, useQuery } from '$lib/houdini';
  import UpdateProfileModal from './UpdateProfileModal.svelte';

  $: query = useQuery(
    graphql(`
      query ProfilePage_Query($handle: String!) @load {
        profile(handle: $handle) {
          name
          handle

          spaces {
            id
            slug
            name
          }

          ...Avatar_profile
          ...ProfilePage_UpdateProfileModal_profile
        }
      }
    `),
  );

  let openUpdateProfile = false;
</script>

<Helmet title={$query.profile.name} />

<div class="flex items-center gap-4">
  <Avatar class="square-24" _profile={$query.profile} />
  <div class="flex grow flex-col gap-2">
    <div class="text-2xl font-semibold">
      {$query.profile.name}
    </div>
    <div class="flex items-center text-sm">
      <span class="i-lc-link mr-1.5 text-gray-50" />
      <div class="text-gray-50">
        {$page.url.host}/
      </div>
      <div>
        @{$query.profile.handle}
      </div>
    </div>
  </div>
  <Button class="flex gap-2" on:click={() => (openUpdateProfile = true)}>
    <span class="i-lc-edit-3" />
    수정
  </Button>
</div>

<hr class="my-8" />

<div class="flex items-center gap-2 font-medium">
  <span class="i-lc-box text-gray-70" />
  스페이스
</div>

<div class="ml-6 mt-4 flex flex-col gap-2">
  {#each $query.profile.spaces as space (space.id)}
    <Link href="/{space.slug}" underline>
      {space.name} ({space.slug})
    </Link>
  {/each}
</div>

<UpdateProfileModal _profile={$query.profile} bind:open={openUpdateProfile} />
