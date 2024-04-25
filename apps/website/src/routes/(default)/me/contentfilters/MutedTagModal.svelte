<script lang="ts">
  import IconTrash from '~icons/tabler/trash';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Icon } from '$lib/components';
  import { Modal } from '$lib/components/v2';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { MeContentFiltersPage_MutedTagModal_user } from '$glitch';

  let _user: MeContentFiltersPage_MutedTagModal_user;
  export { _user as $user };
  export let open = false;

  $: user = fragment(
    _user,
    graphql(`
      fragment MeContentFiltersPage_MutedTagModal_user on User {
        id

        mutedTags {
          id
          name
        }
      }
    `),
  );

  const unmuteTag = graphql(`
    mutation MeContentFiltersPage_UnmuteTag_Mutation($input: UnmuteTagInput!) {
      unmuteTag(input: $input) {
        id
      }
    }
  `);
</script>

<Modal bind:open>
  <svelte:fragment slot="title">뮤트한 태그</svelte:fragment>

  <p class={css({ paddingBottom: '4px', fontSize: '14px', color: 'gray.500' })}>
    총 {$user.mutedTags.length}개의 태그
  </p>

  <ul class={flex({ direction: 'column', minHeight: '160px' })}>
    {#each $user.mutedTags as tag (tag.id)}
      <li
        class={flex({
          align: 'center',
          justify: 'space-between',
          gap: '24px',
          borderTopWidth: { base: '1px', _firstOfType: '0' },
          borderTopColor: 'gray.100',
          marginX: '-20px',
          paddingX: '20px',
          _hover: {
            backgroundColor: 'gray.50',
          },
        })}
      >
        <a
          class={flex({ align: 'center', gap: '4px', grow: '1', paddingY: '16px', fontSize: '14px', truncate: true })}
          href="/tag/{tag.name}"
        >
          #{tag.name}
        </a>
        <button
          class={css({ paddingY: '16px' })}
          type="button"
          on:click={async () => {
            await unmuteTag({ tagId: tag.id });
            mixpanel.track('tag:unmute', { via: 'content-filters' });
          }}
        >
          <Icon style={css.raw({ color: 'gray.500' })} icon={IconTrash} size={24} />
        </button>
      </li>
    {:else}
      <li class={css({ paddingY: '77px', fontSize: '14px', color: 'gray.500', textAlign: 'center' })}>
        뮤트한 태그가 없어요
      </li>
    {/each}
  </ul>
</Modal>
