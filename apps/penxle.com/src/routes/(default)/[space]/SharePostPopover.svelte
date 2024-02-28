<script lang="ts">
  import clsx from 'clsx';
  import qs from 'query-string';
  import { uid } from 'radash';
  import { tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import Button from '$lib/components/v2/Button.svelte';
  import { toast } from '$lib/notification';
  import { createFloatingActions, portal } from '$lib/svelte/actions';
  import type { HTMLAttributes } from 'svelte/elements';

  type $$Props = Omit<HTMLAttributes<HTMLDivElement>, 'role'> & {
    href: string;
  };

  export let href: string;
  let open = false;
  const id = 'share-popover-' + uid(2);
  const twitterLinkId = id + '-twitter-button';
  const mastodonLinkId = id + '-mastodon-button';

  const shareTargetMenuLinkWarpClassname =
    'flex flex-col gap-0.38rem items-center relative [&>label]:(text-13-m color-gray-500 leading-150%)';

  const shareTargetMenuLinkClassName =
    'hover:bg-gray-150 focus-visible:bg-gray-150 square-4rem rounded-2 flex center bg-gray-50 color-gray-500 after:(absolute content-[""] inset-0 cursor-pointer)';

  const { floating, anchor, update } = createFloatingActions({ placement: 'bottom-end', offset: 16 });

  $: if (open) {
    // eslint-disable-next-line unicorn/prefer-top-level-await
    void tick().then(() => update());
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-1 <sm:(z-10 bg-black/50 backdrop-blur transition-opacity)"
    role="button"
    tabindex="-1"
    on:click={() => (open = false)}
    on:keypress={null}
    use:portal
  />
{/if}

<button aria-controls={id} aria-expanded={open} type="button" on:click={() => (open = !open)} use:anchor>
  <slot />
</button>

{#if open}
  <div
    {id}
    role="region"
    use:floating
    {...$$restProps}
    class={clsx(
      'bg-white rounded-0.625rem border-(1px gray-200) sm:(shadow-popup-50 w-23.5rem z-2 <sm:(fixed! z-50 top-initial! bottom-0! left-0! right-0! w-full rounded-b-none shadow-modal-50)',
      $$restProps.class,
    )}
    transition:fade={{ duration: 100 }}
  >
    <header class="p-x-5 p-y-3 flex justify-between items-center color-gray-950 border-(b gray-100)">
      <h1 class="text-16-sb">공유하기</h1>

      <button aria-label="닫기" type="button" on:click={() => (open = false)}>
        <i class="i-tb-x square-6" />
      </button>
    </header>
    <div class="flex justify-center p-y-5 gap-4" role="group">
      <div class={shareTargetMenuLinkWarpClassname}>
        <a
          id={twitterLinkId}
          class={shareTargetMenuLinkClassName}
          href={qs.stringifyUrl({
            url: 'https://twitter.com/intent/tweet',
            query: { text: href },
          })}
          rel="noopener noreferrer"
          target="_blank"
        >
          <i class="i-lg-twitter color-#1D9BF0 square-8" />
        </a>
        <label for={twitterLinkId}>트위터</label>
      </div>
      <div class={shareTargetMenuLinkWarpClassname}>
        <a
          id={mastodonLinkId}
          class={shareTargetMenuLinkClassName}
          href={qs.stringifyUrl({
            url: 'https://share.planet.moe/share',
            query: { text: href },
          })}
        >
          <i class="i-lg-mastodon color-#6364FF square-8" />
        </a>
        <label for={mastodonLinkId}>마스토돈</label>
      </div>
    </div>
    <footer class="m-5 flex">
      <input
        class="flex-1 rounded-l-1 border-(1px gray-200) border-r-none text-14-r p-3"
        readonly
        type="text"
        value={href}
      />
      <Button
        class="flex-shrink-0 rounded-l-none"
        size="lg"
        type="button"
        variant="tertiary"
        on:click={async () => {
          try {
            navigator.clipboard.writeText(href);
            toast.success('클립보드에 복사되었어요');
          } catch (err) {
            toast.error('클립보드 복사를 실패했어요');
            console.error(err);
          }
        }}
      >
        복사
      </Button>
    </footer>
  </div>
{/if}
