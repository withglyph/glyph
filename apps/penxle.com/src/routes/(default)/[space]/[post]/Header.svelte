<script lang="ts">
  import { Link } from '@penxle/ui';
  import { getContext } from 'svelte';
  import Logo from '$assets/icons/logo.svg?component';
  import Wordmark from '$assets/icons/wordmark.svg?component';
  import Button from '$lib/components/v2/Button.svelte';
  import type { Writable } from 'svelte/store';

  const colorScheme = getContext<Writable<'light' | 'dark' | undefined>>('colorScheme');
  const focusMode = getContext<Writable<boolean>>('focusMode');
</script>

<header class="sticky z-10 border-b border-gray-200 dark:bg-gray-900 px-5 py-0.69rem flex justify-between">
  <Link class="mr-3.5 flex items-center gap-2 sm:mr-4 transition w-fit" href="/">
    <Logo class="<sm:square-7.5 sm:square-6" />
    <Wordmark class="<sm:hidden h-5.25 color-icon-primary" />
  </Link>

  <div class="flex gap-4 items-center" role="group">
    <button
      class="square-1.875rem flex center border-(1px solid gray-300) @dark:(border-none bg-gray-600) rounded-full"
      type="button"
      on:click={() => {
        $colorScheme = $colorScheme === 'dark' ? 'light' : 'dark';
      }}
    >
      <i class="i-tb-moon-filled square-4 color-gray-800 @dark:color-white" />
      <span class="sr-only">
        {$colorScheme === 'dark' ? '어둡게 보기' : '밝게 보기'}
      </span>
    </button>
    <Button variant={$focusMode ? 'tertiary' : 'primary'} on:click={() => ($focusMode = !$focusMode)}>
      <span class="flex gap-0.125rem items-center">
        <i class="i-tb-notes square-0.875rem" />
        {#if $focusMode}
          모드해제
        {:else}
          집중모드
        {/if}
      </span>
    </Button>
  </div>
</header>
