<script lang="ts">
  import { production, stack } from '@penxle/lib/environment';
</script>

{#if !production}
  <div
    class="font-mono pointer-events-none fixed bottom-0 right-0 z-50 flex center gap-2 border-red-50 rounded-lt bg-red-10/80 px-4 py-2 text-center font-black tracking-widest text-red-50"
  >
    <span class="i-lc-git-branch" />
    {stack}
  </div>
{/if}
