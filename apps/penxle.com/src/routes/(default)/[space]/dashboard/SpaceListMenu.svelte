<script lang="ts">
  import { computePosition, flip, offset, shift } from '@floating-ui/dom';
  import { tick } from 'svelte';
  import { beforeNavigate } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { Button } from '$lib/components';
  import Image from '$lib/components/Image.svelte';
  import { portal } from '$lib/svelte/actions';
  import CreateSpaceModal from '../../CreateSpaceModal.svelte';
  import type { SpaceDashboardLayout_SpaceListMenu_query } from '$glitch';

  let targetEl: HTMLButtonElement;
  let menuEl: HTMLDivElement;

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
          ...DefaultLayout_CreateSpaceModal_user

          spaces {
            id
            slug
            name
            visibility
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

  const update = async () => {
    await tick();

    const position = await computePosition(targetEl, menuEl, {
      placement: 'left-start',
      middleware: [offset(16), flip(), shift({ padding: 8 })],
    });

    Object.assign(menuEl.style, {
      left: `${position.x}px`,
      top: `${position.y}px`,
    });
  };

  $: if (open) {
    void update();
  }

  beforeNavigate(() => {
    open = false;
  });
</script>

<button
  bind:this={targetEl}
  class="flex items-center gap-3 bg-primary rounded-lg p-2 w-full"
  type="button"
  on:click={() => (open = !open)}
>
  <Image class="square-12 rounded-lg flex-none" $image={$query.space.icon} />
  <div class="truncate">
    <h3 class="body-14-b truncate">{$query.space.name}</h3>
    <div class="flex items-center gap-1 caption-12-m text-secondary">
      {#if $query.space.visibility === 'PUBLIC'}
        <span class="block square-1.25 rounded-full bg-green-50" />
        <span>공개중</span>
      {:else}
        <span class="block square-1.25 rounded-full bg-text-disabled" />
        <span>비공개중</span>
      {/if}
    </div>
  </div>
</button>

{#if open}
  <div
    class="fixed inset-0 z-49"
    role="button"
    tabindex="-1"
    on:click={() => (open = false)}
    on:keypress={null}
    use:portal
  />

  <div
    bind:this={menuEl}
    class="absolute z-50 w-52 py-4 px-3 rounded-2xl shadow-[0_4px_4px_0px_rgba(0,0,0,0.10)] bg-cardprimary"
    use:portal
  >
    <div class="space-y-3">
      {#each $query.me.spaces as space (space.id)}
        <a class="p-1 flex gap-2 items-center" href={`/${space.slug}/dashboard`}>
          <div class="bg-black square-10.5 rounded-lg" />
          <div>
            <p class="body-15-b mb-1">{space.name}</p>
            <div class="flex items-center gap-1 caption-12-m text-secondary">
              {#if space.visibility === 'PUBLIC'}
                <span class="block square-1.25 rounded-full bg-green-50" />
                <span>공개중</span>
              {:else}
                <span class="block square-1.25 rounded-full bg-text-disabled" />
                <span>비공개중</span>
              {/if}
            </div>
          </div>
        </a>
      {/each}
    </div>
    <div class="w-full border-b border-alphagray-10 my-3" />

    <Button size="xs" variant="text" on:click={() => (openCreateSpace = true)}>
      <span class="i-lc-plus square-3.5 mr-1" />
      스페이스 만들기
    </Button>
  </div>
{/if}

<CreateSpaceModal $user={$query.me} bind:open={openCreateSpace} />
