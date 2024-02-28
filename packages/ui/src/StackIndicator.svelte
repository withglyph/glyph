<script lang="ts">
  import { production, stack } from '@penxle/lib/environment';
</script>

{#if !production}
  <div
    class="font-mono pointer-events-none fixed bottom-0 right-0 z-50 flex center gap-2 border-red-50 rounded-lt bg-red-10/80 px-4 py-2 text-center font-black tracking-widest text-red-50"
  >
    <svg
      fill="none"
      height="1rem"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1.5"
      viewBox="0 0 24 24"
      width="1rem"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 0h24v24H0z" fill="none" stroke="none" />
      <path d="M7 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      <path d="M7 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      <path d="M17 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      <path d="M7 8l0 8" />
      <path d="M9 18h6a2 2 0 0 0 2 -2v-5" />
      <path d="M14 14l3 -3l3 3" />
    </svg>

    {stack}
  </div>
{/if}
