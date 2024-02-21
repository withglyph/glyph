<script lang="ts">
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import Footer from '../../Footer.svelte';
  import Header from './Header.svelte';

  let focusMode = writable(false);

  setContext('focusMode', focusMode);
</script>

<main>
  <Header />
  <slot />
</main>

<Footer />
