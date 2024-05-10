<script lang="ts">
  import { production } from '@withglyph/lib/environment';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import FullLogo from '$assets/logos/full.svg?component';
  import { Helmet, Link } from '$lib/components';
  import { Button, Modal } from '$lib/components/v2';
  import { AppError, UnknownError } from '$lib/errors';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';

  let open = false;

  $: error = $page.error ? AppError.deserialize($page.error) : new UnknownError('Really unknown error');
  $: code = error.extra.code ?? $page.status;

  onMount(() => {
    let previousKeys: string[] = [];

    const handler = (event: KeyboardEvent) => {
      previousKeys.push(event.key);

      if (
        previousKeys.slice(-10).join(' ') ===
        'ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight b a'
      ) {
        open = true;
        previousKeys = [];
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });
</script>

<Helmet description="글리프 에러 페이지" title="글리프" />

<header
  class={flex({
    align: 'center',
    paddingX: { base: '16px', sm: '30px' },
    paddingY: '8px',
    width: 'full',
    height: '60px',
    zIndex: '10',
  })}
>
  <nav>
    <Link href="/">
      <FullLogo class={css({ height: '25px', hideBelow: 'sm', color: 'gray.900' })} />
    </Link>
  </nav>
</header>

<div
  class={flex({
    direction: 'column',
    justify: 'space-between',
    align: 'center',
    grow: '1',
    marginX: 'auto',
    marginY: '48px',
  })}
>
  <div />

  <section class={center({ flexDirection: 'column', textAlign: 'center' })}>
    <svg class={css({ width: '100px' })} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M59.477 31.133a1 1 0 0 0-1.023.042l-2.16 1.407-2.624-5.032a1 1 0 0 0-.724-.524 1.01 1.01 0 0 0-.853.264l-4.207 4.017-3.541-2.333a1 1 0 0 0-1.1 1.67l4.205 2.77a.999.999 0 0 0 1.24-.111l3.822-3.649 2.518 4.83a1.006 1.006 0 0 0 1.433.375L58 33.857v5.544H6V11.013a2.002 2.002 0 0 1 2-2h3v4.382a1 1 0 0 0 .83.985l6.016 1.038-3.135 4.673a1.006 1.006 0 0 0 .293 1.401l4.459 2.836a1 1 0 0 0 1.074-1.687l-3.595-2.286 3.423-5.103a1.006 1.006 0 0 0-.66-1.543L13 12.553v-4.54a1 1 0 0 0-1-1H8a4.004 4.004 0 0 0-4 4V42.4a4.004 4.004 0 0 0 4 4h18.655l-3.339 8.586H20a1 1 0 0 0 0 2h24a1 1 0 0 0 0-2h-3.316L37.345 46.4H56a4.004 4.004 0 0 0 4-4V32.013a1.002 1.002 0 0 0-.523-.88ZM38.539 54.987H25.46l3.34-8.586h6.399ZM58 42.401a2.002 2.002 0 0 1-2 2H8a2.002 2.002 0 0 1-2-2v-1h52ZM56 7.013H20a1 1 0 0 0 0 2h36a2.002 2.002 0 0 1 2 2v13a1 1 0 0 0 2 0v-13a4.004 4.004 0 0 0-4-4Z"
      />
    </svg>

    <h2 class={css({ marginTop: '16px', fontSize: '24px', fontWeight: 'semibold' })}>
      {#if code === 404}
        여기는⋯ 아무것도 없어요.
      {:else}
        앗, 무언가 잘못되었어요.
      {/if}
    </h2>

    <p class={css({ marginTop: '16px', fontSize: '14px', color: 'gray.600' })}>
      {#if code === 404}
        페이지를 찾을 수가 없었어요.
        <br />
        주소가 정확한지 다시 한번 확인해 주세요.
      {:else}
        {error.message}
      {/if}
    </p>

    <a
      class={css({
        borderRadius: 'full',
        marginTop: '64px',
        paddingX: '16px',
        paddingY: '8px',
        fontWeight: 'medium',
        lineHeight: 'none',
        color: 'gray.5',
        backgroundColor: { base: 'gray.800', _hover: 'gray.900', _active: 'gray.900' },
        transition: 'common',
      })}
      href="/"
    >
      글리프 홈으로 가기
    </a>
  </section>

  <div class={center({ flexDirection: 'column', gap: '8px' })}>
    {#if !production}
      <button
        class={css({ fontSize: '14px', color: 'gray.600', cursor: 'pointer' })}
        type="button"
        on:click={() => (open = true)}
      >
        추가 정보
      </button>
    {/if}
    {#if error.extra.id}
      <span class={css({ fontSize: '14px', color: 'gray.600' })}>
        추적 ID: {error.extra.id}
      </span>
    {/if}
  </div>
</div>

<Modal bind:open>
  <svelte:fragment slot="title">추가 정보</svelte:fragment>

  <div class={css({ fontFamily: 'mono', overflow: 'auto', whiteSpace: 'pre', wordBreak: 'keep-all' })}>
    {#if error instanceof UnknownError}
      {error.cause.stack}
    {:else}
      {JSON.stringify(error, null, 2)}
    {/if}
  </div>

  <Button slot="action" size="md" on:click={() => (open = false)}>닫기</Button>
</Modal>
