<script lang="ts">
  import { PUBLIC_VERCEL_GIT_COMMIT_REF } from '$env/static/public';
</script>

<div
  class="pointer-events-none fixed bottom-0 right-0 z-50 border-red-500 rounded-lt bg-red-100/80 px-4 py-2 text-center font-black tracking-widest text-red-500 font-mono"
>
  {PUBLIC_VERCEL_GIT_COMMIT_REF}
</div>
