<script lang="ts">
  import clsx from 'clsx';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Modal, Tag } from '$lib/components';
  import { PopupSearch } from '$lib/components/forms';
  import { toast } from '$lib/notification';
  import type { ChangeEventHandler } from 'svelte/elements';
  import type { MeSettingsContentFiltersPage_MutedTagModal_user } from '$glitch';

  let _user: MeSettingsContentFiltersPage_MutedTagModal_user;
  export { _user as $user };
  export let open = false;

  let tags: typeof $user.mutedTags = [];
  let query = '';

  $: user = fragment(
    _user,
    graphql(`
      fragment MeSettingsContentFiltersPage_MutedTagModal_user on User {
        id

        mutedTags {
          id
          name
        }
      }
    `),
  );

  const unmuteTag = graphql(`
    mutation MeSettingsContentFiltersPage_UnmuteTag_Mutation($input: UnmuteTagInput!) {
      unmuteTag(input: $input) {
        id
      }
    }
  `);

  const unmuteTags = () => {
    mixpanel.track('tag:unmute', { via: 'content-filters' });
    return Promise.all(tags.map(({ id }) => unmuteTag({ tagId: id })));
  };

  const handleChange = (e: Parameters<ChangeEventHandler<HTMLInputElement>>[0], tag: (typeof $user.mutedTags)[0]) => {
    const { checked } = e.currentTarget;

    tags = checked ? [...tags, tag] : tags.filter((t) => t.id !== tag.id);
  };
</script>

<Modal size="md" bind:open>
  <svelte:fragment slot="title">숨긴 태그</svelte:fragment>
  <svelte:fragment slot="subtitle">태그를 선택하면 해제할 수 있어요</svelte:fragment>

  <PopupSearch
    class={clsx('mb-4', $user.mutedTags.length === 0 && 'hidden')}
    on:input={(event) => (query = event.currentTarget.value.trim())}
  />

  <ul class="flex flex-wrap gap-2.5 min-h-10rem max-h-15rem overflow-y-auto">
    {#each $user.mutedTags.filter((tag) => tag.name.includes(query)) as tag (tag.id)}
      <Tag class="h-fit" as="label" checked={tags.includes(tag)} on:change={(e) => handleChange(e, tag)}>
        {tag.name}
      </Tag>
    {:else}
      <article class="text-secondary body-16-m self-center m-x-auto break-keep">
        {$user.mutedTags.length === 0 ? '숨긴 태그가 없어요' : '일치하는 검색 결과가 없어요'}
      </article>
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
          await unmuteTags();
          toast.success('선택한 태그들의 숨기기가 해제되었어요');
          tags = [];
        }}
      >
        해제
      </Button>
    {/if}
  </div>
</Modal>
