<script lang="ts">
  import { PUBLIC_VERCEL_GIT_COMMIT_REF } from '$env/static/public';
</script>

<div
  class="pointer-events-none fixed bottom-0 right-0 z-50 flex center gap-2 border-red-50 rounded-lt bg-red-10/80 px-4 py-2 text-center font-black tracking-widest text-red-50 font-mono"
>
  <span class="i-lc-git-branch" />
  {PUBLIC_VERCEL_GIT_COMMIT_REF}
</div>
