<script lang="ts">
  import qs from 'query-string';
  import { uid } from 'radash';
  import { tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import IconMastodon from '~icons/simple-icons/mastodon';
  import IconTwitter from '~icons/simple-icons/twitter';
  import IconX from '~icons/tabler/x';
  import { Button, Icon } from '$lib/components';
  import { TextInput } from '$lib/components/forms';
  import { toast } from '$lib/notification';
  import { createFloatingActions, portal } from '$lib/svelte/actions';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { HTMLAttributes } from 'svelte/elements';
  import type { SystemStyleObject } from '$styled-system/types';

  type $$Props = Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'class' | 'style'> & {
    href: string;
    style?: SystemStyleObject;
    disabled?: boolean;
  };

  export let style: SystemStyleObject | undefined = undefined;
  export let href: string;
  export let disabled = false;

  let open = false;
  let copied = false;
  const id = 'share-popover-' + uid(2);
  const twitterLinkId = id + '-twitter-button';
  const mastodonLinkId = id + '-mastodon-button';

  const shareTargetMenuLinkWarpClassname = css({
    'position': 'relative',
    'display': 'flex',
    'flexDirection': 'column',
    'alignItems': 'center',
    'gap': '6px',

    '& > label': {
      fontSize: '14px',
      color: 'gray.500',
    },
  });

  const shareTargetMenuLinkClassName = css({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    size: '80px',
    color: 'gray.600',
    backgroundColor: { base: 'gray.50', _hover: 'gray.150', _focusVisible: 'gray.150' },
    _after: {
      content: '""',
      position: 'absolute',
      inset: '0',
      cursor: 'pointer',
    },
  });

  const { floating, anchor, update } = createFloatingActions({ placement: 'bottom-start', offset: 6 });

  $: if (open) {
    // eslint-disable-next-line unicorn/prefer-top-level-await
    void tick().then(() => update());
  }
</script>

{#if open}
  <div
    class={css({
      position: 'fixed',
      inset: '0',
      zIndex: '1',
      smDown: {
        backgroundColor: 'gray.900/50',
        transition: 'opacity',
        backdropFilter: 'auto',
        backdropBlur: '8px',
        zIndex: '10',
      },
    })}
    role="button"
    tabindex="-1"
    on:click={() => (open = false)}
    on:keypress={null}
    use:portal
  />
{/if}

<button
  class={css(style)}
  aria-controls={id}
  aria-expanded={open}
  {disabled}
  type="button"
  on:click={() => (open = !open)}
  use:anchor
>
  <slot />
</button>

{#if open}
  <div
    {id}
    role="region"
    use:floating
    {...$$restProps}
    class={css({
      borderColor: 'gray.600',
      backgroundColor: 'gray.0',
      sm: {
        borderWidth: '1px',
        width: '376px',
        zIndex: '2',
      },
      smDown: {
        position: '[fixed!]',
        top: '[initial!]',
        bottom: '[0!]',
        left: '[0!]',
        right: '[0!]',
        borderTopWidth: '1px',
        width: 'full',
        zIndex: '50',
      },
    })}
    transition:fade={{ duration: 100 }}
  >
    <header
      class={css({
        position: 'relative',
        borderBottomWidth: '1px',
        borderBottomColor: 'gray.150',
        paddingX: '20px',
        paddingY: '12px',
        fontSize: '18px',
        color: 'gray.900',
      })}
    >
      <h1 class={css({ fontWeight: 'semibold', textAlign: 'center' })}>공유</h1>

      <button
        class={css({ position: 'absolute', top: '1/2', translate: 'auto', translateY: '-1/2', right: '20px' })}
        aria-label="닫기"
        type="button"
        on:click={() => (open = false)}
      >
        <Icon icon={IconX} size={24} />
      </button>
    </header>

    <div class={flex({ justify: 'center', gap: '32px', paddingTop: '48px', paddingBottom: '28px' })} role="group">
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
          <Icon style={css.raw({ color: '[#1D9BF0]' })} icon={IconTwitter} size={32} />
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
          <Icon style={css.raw({ color: '[#6364FF]' })} icon={IconMastodon} size={32} />
        </a>
        <label for={mastodonLinkId}>마스토돈</label>
      </div>
    </div>
    <footer
      class={flex({
        margin: '20px',
        borderWidth: '1px',
        borderColor: 'gray.200',
      })}
    >
      <div class={css({ flexGrow: '1', minWidth: '0' })}>
        <TextInput readonly size="md" type="text" value={href} />
      </div>
      <Button
        style={css.raw({ flex: 'none', fontSize: '14px', width: '76px' })}
        size="md"
        type="button"
        on:click={async () => {
          try {
            navigator.clipboard.writeText(href);
            copied = true;

            setTimeout(() => {
              copied = false;
            }, 1000);
          } catch (err) {
            toast.error('클립보드 복사를 실패했어요');
            console.error(err);
          }
        }}
      >
        {copied ? '복사완료' : '복사'}
      </Button>
    </footer>
  </div>
{/if}
