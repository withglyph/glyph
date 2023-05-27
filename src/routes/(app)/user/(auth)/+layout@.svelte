<script lang="ts">
  import Wordmark from '$assets/branding/wordmark.svg?component';
  import { Image } from '$lib/components';
</script>

<main class="flex grow center">
  <Image
    class="pointer-events-none absolute inset-0 h-full w-full"
    src="https://picsum.photos/1920/1080"
  />

  <a class="absolute left-4 top-4 z-1" href="/">
    <Wordmark class="h-6 text-white" />
  </a>

  <div class="z-1 rounded-xl bg-white p-12 shadow-2xl">
    <slot />
  </div>
</main>
