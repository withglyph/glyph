<script lang="ts">
  import IconPlus from '~icons/tabler/plus';
  import { beforeNavigate } from '$app/navigation';
  import { fragment, graphql } from '$bifrost';
  import { Button, Icon } from '$lib/components';
  import Image from '$lib/components/Image.svelte';
  import { createFloatingActions, portal } from '$lib/svelte/actions';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import CreateSpaceModal from '../../CreateSpaceModal.svelte';
  import type { SpaceDashboardLayout_SpaceListMenu_query } from '$bifrost';

  let _query: SpaceDashboardLayout_SpaceListMenu_query;
  export { _query as $query };

  let open = false;
  let openCreateSpace = false;

  $: query = fragment(
    _query,
    graphql(`
      fragment SpaceDashboardLayout_SpaceListMenu_query on Query {
        me @_required {
          id
          ...CreateSpaceModal_user

          spaces {
            id
            slug
            name
            visibility

            icon {
              id
              ...Image_image
            }
          }
        }

        space(slug: $slug) {
          id
          slug
          name
          visibility

          icon {
            id
            ...Image_image
          }
        }
      }
    `),
  );

  const { anchor, floating } = createFloatingActions({
    placement: 'left-start',
    offset: 16,
  });

  beforeNavigate(() => {
    open = false;
  });
</script>

<button
  class={flex({ align: 'center', gap: '12px', borderRadius: '8px', padding: '8px', width: 'full' })}
  type="button"
  on:click={() => (open = !open)}
  use:anchor
>
  <Image
    style={css.raw({ flex: 'none', borderWidth: '1px', borderColor: 'gray.200', borderRadius: '8px', size: '48px' })}
    $image={$query.space.icon}
    size={48}
  />
  <div class={css({ truncate: true })}>
    <h3 class={css({ fontSize: '14px', fontWeight: 'bold', truncate: true })}>{$query.space.name}</h3>
    <div class={flex({ align: 'center', gap: '4px', fontSize: '12px', fontWeight: 'medium', color: 'gray.500' })}>
      {#if $query.space.visibility === 'PUBLIC'}
        <div class={css({ borderRadius: 'full', size: '5px', backgroundColor: '[#4ECEA6]' })} />
        <span>공개중</span>
      {:else}
        <div class={css({ borderRadius: 'full', size: '5px', backgroundColor: 'gray.500' })} />
        <span>비공개중</span>
      {/if}
    </div>
  </div>
</button>

{#if open}
  <div
    class={css({ position: 'fixed', inset: '0', zIndex: '40' })}
    role="button"
    tabindex="-1"
    on:click={() => (open = false)}
    on:keypress={null}
    use:portal
  />

  <div
    class={css({
      paddingX: '12px',
      paddingY: '16px',
      borderRadius: '16px',
      width: '208px',
      backgroundColor: 'gray.5',
      boxShadow: '[0 4px 4px 0px {colors.gray.900/10}]',
      zIndex: '50',
    })}
    use:floating
  >
    <div class={flex({ direction: 'column', gap: '12px' })}>
      {#each $query.me.spaces as space (space.id)}
        <a
          class={flex({
            align: 'center',
            gap: '8px',
            borderRadius: '12px',
            padding: '4px',
            _hover: { backgroundColor: 'gray.50' },
          })}
          href={`/${space.slug}/dashboard/settings`}
        >
          <Image
            style={css.raw({
              flex: 'none',
              borderWidth: '1px',
              borderColor: 'gray.200',
              borderRadius: '8px',
              size: '42px',
            })}
            $image={space.icon}
            size={48}
          />
          <div class={css({ truncate: true })}>
            <p class={css({ marginBottom: '4px', fontSize: '15px', fontWeight: 'bold', truncate: true })}>
              {space.name}
            </p>
            <div
              class={flex({ align: 'center', gap: '4px', fontSize: '12px', fontWeight: 'medium', color: 'gray.500' })}
            >
              {#if space.visibility === 'PUBLIC'}
                <div class={css({ borderRadius: 'full', size: '5px', backgroundColor: '[#4ECEA6]' })} />
                <span>공개중</span>
              {:else}
                <div class={css({ borderRadius: 'full', size: '5px', backgroundColor: 'gray.500' })} />
                <span>비공개중</span>
              {/if}
            </div>
          </div>
        </a>
      {/each}
    </div>

    <div class={css({ borderBottomWidth: '1px', borderBottomColor: 'gray.900/10', marginY: '12px', width: 'full' })} />

    <Button size="xs" variant="text" on:click={() => (openCreateSpace = true)}>
      <Icon style={css.raw({ marginRight: '4px' })} icon={IconPlus} />
      스페이스 만들기
    </Button>
  </div>
{/if}

<CreateSpaceModal $user={$query.me} via="space-list-menu" bind:open={openCreateSpace} />
