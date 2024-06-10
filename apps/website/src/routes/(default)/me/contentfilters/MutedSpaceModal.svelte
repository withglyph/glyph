<script lang="ts">
  import IconTrash from '~icons/tabler/trash';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Icon, Image, Modal } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { MeContentFiltersPage_MutedSpaceModal_user } from '$glitch';

  let _user: MeContentFiltersPage_MutedSpaceModal_user;
  export { _user as $user };
  export let open = false;

  $: user = fragment(
    _user,
    graphql(`
      fragment MeContentFiltersPage_MutedSpaceModal_user on User {
        id

        mutedSpaces {
          id
          slug
          name

          icon {
            id
            ...Image_image
          }
        }
      }
    `),
  );

  const unmuteSpace = graphql(`
    mutation MeContentFiltersPage_UnmuteSpace_Mutation($input: UnmuteSpaceInput!) {
      unmuteSpace(input: $input) {
        id
        muted
      }
    }
  `);
</script>

<Modal bind:open>
  <svelte:fragment slot="title">뮤트한 스페이스</svelte:fragment>

  <p class={css({ paddingBottom: '4px', fontSize: '14px', color: 'gray.500' })}>
    총 {$user.mutedSpaces.length}개의 스페이스
  </p>

  <ul
    class={css(
      {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '160px',
      },
      $user.mutedSpaces?.length === 0 && { justifyContent: 'center' },
    )}
  >
    {#each $user.mutedSpaces as space (space.id)}
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
          class={flex({ align: 'center', gap: '4px', grow: '1', paddingY: '16px', truncate: true })}
          href="/{space.slug}"
        >
          <Image
            style={css.raw({
              flex: 'none',
              borderWidth: '[0.8px]',
              borderColor: 'gray.100',
              size: '18px',
            })}
            $image={space.icon}
            size={24}
          />
          <p class={css({ flexGrow: '1', fontSize: '14px', truncate: true })}>{space.name}</p>
        </a>
        <button
          class={css({ paddingY: '16px' })}
          type="button"
          on:click={async () => {
            await unmuteSpace({ spaceId: space.id });
            mixpanel.track('space:unmute', { spaceId: space.id, via: 'content-filters' });
          }}
        >
          <Icon style={css.raw({ color: 'gray.500' })} icon={IconTrash} size={24} />
        </button>
      </li>
    {:else}
      <li class={css({ paddingY: '77px', fontSize: '14px', color: 'gray.500', textAlign: 'center' })}>
        뮤트한 스페이스가 없어요
      </li>
    {/each}
  </ul>
</Modal>
