<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import Footer from '../../Footer.svelte';
  import Header from './Header.svelte';

  let colorScheme = writable<'light' | 'dark' | undefined>(undefined);
  let focusMode = writable(false);

  setContext('colorScheme', colorScheme);
  setContext('focusMode', focusMode);

  onMount(() => {
    $colorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
</script>

<main class={$colorScheme}>
  <Header />
  <slot />
</main>

<Footer />
