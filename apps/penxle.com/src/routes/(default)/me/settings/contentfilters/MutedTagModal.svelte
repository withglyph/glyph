<script lang="ts">
  import { fragment, graphql } from '$glitch';
  import { Button, Modal, Tag } from '$lib/components';
  import { toast } from '$lib/notification';
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
    return Promise.all(tags.map(({ id }) => unmuteTag({ tagId: id })));
  };

  const handleChange = (e: Event, tag: (typeof $user.mutedTags)[0]) => {
    const { checked } = e.currentTarget as HTMLInputElement;

    tags = checked ? [...tags, tag] : tags.filter((t) => t.id !== tag.id);
  };
</script>

<Modal size="md" bind:open>
  <svelte:fragment slot="title">숨긴 태그</svelte:fragment>
  <svelte:fragment slot="subtitle">태그를 선택하면 해제할 수 있어요</svelte:fragment>

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
    {#each $user.mutedTags.filter((tag) => tag.name.includes(query)) as tag (tag.id)}
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
