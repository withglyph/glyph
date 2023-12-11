<script lang="ts">
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Modal, Tag } from '$lib/components';
  import { toast } from '$lib/notification';
  import type { MeCabinetsPage_FollowTagModal_user } from '$glitch';

  let _user: MeCabinetsPage_FollowTagModal_user;
  export { _user as $user };
  export let open = false;

  let tags: typeof $user.followedTags = [];
  let query = '';

  $: user = fragment(
    _user,
    graphql(`
      fragment MeCabinetsPage_FollowTagModal_user on User {
        id

        followedTags {
          id
          name
        }
      }
    `),
  );

  const unfollowTag = graphql(`
    mutation MeCabinetsPage_UnfollowTag_Mutation($input: UnfollowTagInput!) {
      unfollowTag(input: $input) {
        id
      }
    }
  `);

  const unfollowTags = () => {
    mixpanel.track('tag:unfollow', { via: 'cabinet' });
    return Promise.all(tags.map(({ id }) => unfollowTag({ tagId: id })));
  };

  const handleChange = (e: Event, tag: (typeof $user.followedTags)[0]) => {
    const { checked } = e.currentTarget as HTMLInputElement;

    tags = checked ? [...tags, tag] : tags.filter((t) => t.id !== tag.id);
  };
</script>

<Modal size="md" bind:open>
  <svelte:fragment slot="title">관심 태그</svelte:fragment>

  <form class="relative h-11.5 w-full mb-4" on:submit|preventDefault>
    <input
      class="rounded-2.5 h-11.5 w-full bg-primary py-1.75 pr-3.5 pl-11 w-full border border-bg-primary transition focus-within:border-tertiary!"
      type="text"
      on:input={(e) => (query = e.currentTarget.value.trim())}
    />
    <div class="absolute inset-y-0 left-3.5 flex center text-secondary h-100%">
      <i class="i-lc-search square-5 transition" />
    </div>
  </form>

  <ul class="flex flex-wrap gap-2.5">
    {#each $user.followedTags.filter((tag) => tag.name.includes(query)) as tag (tag.id)}
      <Tag as="label" checked={tags.includes(tag)} on:change={(e) => handleChange(e, tag)}>{tag.name}</Tag>
    {/each}
  </ul>

  <div class="flex gap-3 mt-4">
    <Button class="grow-10" size="xl" on:click={() => (open = false)}>닫기</Button>
    {#if tags.length > 0}
      <Button
        class="grow"
        color="tertiary"
        size="xl"
        variant="outlined"
        on:click={async () => {
          await unfollowTags();
          toast.success('선택한 태그들의 관심 해제되었어요');
          tags = [];
        }}
      >
        해제
      </Button>
    {/if}
  </div>
</Modal>
