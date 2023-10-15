<script lang="ts">
  import { computePosition, flip, offset, shift } from '@floating-ui/dom';
  import { tick } from 'svelte';
  import { beforeNavigate } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { Button } from '$lib/components';
  import { portal } from '$lib/svelte/actions';
  import CreateSpaceModal from '../../CreateSpaceModal.svelte';
  import type { SpaceSettingLayout_SpaceListMenu_user } from '$glitch';

  let targetEl: HTMLButtonElement;
  let menuEl: HTMLDivElement;

  let _user: SpaceSettingLayout_SpaceListMenu_user;
  let open = false;
  let openCreateSpace = false;

  export { _user as $user };
  export let currentSpace: string;

  $: user = fragment(
    _user,
    graphql(`
      fragment SpaceSettingLayout_SpaceListMenu_user on User {
        id

        spaces {
          id
          slug
          name
        }

        ...DefaultLayout_CreateSpaceModal_user
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
  <div class="bg-black square-12 rounded-lg" />
  <div>
    <h3 class="body-14-b">{currentSpace}</h3>
    <div class="flex items-center gap-1 caption-12-m text-secondary">
      <span class="block square-1.25 rounded-full bg-green-50" />
      <span>공개중</span>
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
      {#each $user.spaces as space (space.id)}
        <a class="p-1 flex gap-2 items-center" href={`/${space.slug}/dashboard`}>
          <div class="bg-black square-10.5 rounded-lg" />
          <div>
            <p class="body-15-b mb-1">{space.name}</p>
            <div class="flex items-center gap-1 caption-12-m text-secondary">
              <span class="block square-1.25 rounded-full bg-green-50" />
              <span>공개중</span>
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

<CreateSpaceModal {$user} bind:open={openCreateSpace} />
