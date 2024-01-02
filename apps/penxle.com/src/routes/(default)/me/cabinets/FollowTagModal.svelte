<script lang="ts">
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Modal, Tag } from '$lib/components';
  import { toast } from '$lib/notification';
  import type { ChangeEventHandler } from 'svelte/elements';
  import type { MeCabinetsPage_FollowTagModal_user } from '$glitch';

  let _user: MeCabinetsPage_FollowTagModal_user;
  export { _user as $user };
  export let open = false;

  let tags: typeof $user.followedTags = [];

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

  const handleChange = (
    e: Parameters<ChangeEventHandler<HTMLInputElement>>[0],
    tag: (typeof $user.followedTags)[0],
  ) => {
    const { checked } = e.currentTarget;

    tags = checked ? [...tags, tag] : tags.filter((t) => t.id !== tag.id);
  };
</script>

<Modal size="md" bind:open>
  <svelte:fragment slot="title">관심 태그 관리</svelte:fragment>
  <svelte:fragment slot="subtitle">태그를 선택해 관심태그를 해제할 수 있어요</svelte:fragment>

  <ul class="flex flex-wrap gap-2.5 min-h-10rem max-h-15rem overflow-y-auto">
    {#each $user.followedTags as tag (tag.id)}
      <Tag class="h-fit" as="label" checked={tags.includes(tag)} on:change={(e) => handleChange(e, tag)}>
        {tag.name}
      </Tag>
    {:else}
      <article class="text-secondary body-16-m self-center m-x-auto break-keep">아직 추가된 관심 태그가 없어요</article>
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
