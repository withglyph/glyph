<script lang="ts">
  import Wordmark from '$assets/branding/wordmark.svg?component';
</script>

<main class="flex grow center bg-brand-500">
  <a class="absolute left-4 top-4" href="/">
    <Wordmark class="h-6 text-white" />
  </a>

  <div class="rounded-lg bg-gray-50 p-12 shadow-2xl">
    <slot />
  </div>
</main>
