<script lang="ts">
  import { Helmet, Link } from '@penxle/ui';
  import { page } from '$app/stores';
  import Logo from '$assets/icons/logo.svg?component';
  import { Button, Modal } from '$lib/components';
  import { AppError, UnknownError } from '$lib/errors';

  let open = false;

  $: error = $page.error ? AppError.deserialize($page.error) : new UnknownError('Really unknown error');
  $: code = error.extra.code ?? $page.status;
</script>

<Helmet title="펜슬" />

<header class="z-10 w-full h-15 px-4 py-2 flex items-center sm:px-7.5">
  <nav>
    <Link href="/">
      <Logo class="<sm:hidden sm:square-6" />
    </Link>
  </nav>
</header>

<div class="mx-auto my-12 flex grow flex-col items-center justify-between">
  <div />

  <section class="flex flex-col center text-center">
    <svg class="w-25" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M59.477 31.133a1 1 0 0 0-1.023.042l-2.16 1.407-2.624-5.032a1 1 0 0 0-.724-.524 1.01 1.01 0 0 0-.853.264l-4.207 4.017-3.541-2.333a1 1 0 0 0-1.1 1.67l4.205 2.77a.999.999 0 0 0 1.24-.111l3.822-3.649 2.518 4.83a1.006 1.006 0 0 0 1.433.375L58 33.857v5.544H6V11.013a2.002 2.002 0 0 1 2-2h3v4.382a1 1 0 0 0 .83.985l6.016 1.038-3.135 4.673a1.006 1.006 0 0 0 .293 1.401l4.459 2.836a1 1 0 0 0 1.074-1.687l-3.595-2.286 3.423-5.103a1.006 1.006 0 0 0-.66-1.543L13 12.553v-4.54a1 1 0 0 0-1-1H8a4.004 4.004 0 0 0-4 4V42.4a4.004 4.004 0 0 0 4 4h18.655l-3.339 8.586H20a1 1 0 0 0 0 2h24a1 1 0 0 0 0-2h-3.316L37.345 46.4H56a4.004 4.004 0 0 0 4-4V32.013a1.002 1.002 0 0 0-.523-.88ZM38.539 54.987H25.46l3.34-8.586h6.399ZM58 42.401a2.002 2.002 0 0 1-2 2H8a2.002 2.002 0 0 1-2-2v-1h52ZM56 7.013H20a1 1 0 0 0 0 2h36a2.002 2.002 0 0 1 2 2v13a1 1 0 0 0 2 0v-13a4.004 4.004 0 0 0-4-4Z"
      />
    </svg>

    <h2 class="mt-4 text-2xl font-semibold">
      {#if code === 404}
        여기는⋯ 아무것도 없어요.
      {:else}
        앗, 무언가 잘못되었어요.
      {/if}
    </h2>

    <p class="mt-4 text-sm text-gray-50">
      {#if code === 404}
        페이지를 찾을 수가 없었어요.
        <br />
        주소가 정확한지 다시 한번 확인해 주세요.
      {:else}
        {error.message}
      {/if}
    </p>

    <a
      class="mt-16 rounded-full bg-gray-80 px-4 py-2 font-medium leading-none text-white transition duration-300 active:bg-black hover:bg-gray-90"
      href="/"
    >
      펜슬 홈으로 가기
    </a>
  </section>

  <div class="flex flex-col gap-2 center">
    {#if error instanceof UnknownError && error.cause}
      <button class="cursor-pointer text-sm text-gray-50" type="button" on:click={() => (open = true)}>
        디버깅 정보
      </button>
    {:else if error.extra.id}
      <span class="text-sm text-gray-50">
        추적 ID: {error.extra.id}
      </span>
    {/if}
  </div>
</div>

{#if error instanceof UnknownError && error.cause}
  {@const { name, message, stack } = error.cause}
  <Modal bind:open>
    <svelte:fragment slot="title">{name}: {message}</svelte:fragment>

    <div class="font-mono overflow-auto whitespace-pre">
      {stack ?? 'Stacktrace not available'}
    </div>

    <Button slot="action" size="md" on:click={() => (open = false)}>닫기</Button>
  </Modal>
{/if}
