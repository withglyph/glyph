<script lang="ts">
  import { Switch } from '$lib/components/forms';

  export let name: string;
  export let content: string;
  export let website = false;
  export let email = false;
</script>

<div
  class="flex flex-col flex-wrap justify-center sm:(flex-row items-center justify-between flex-nowrap)"
>
  <div class="flex items-center justify-between py-4 px-6 sm:p-0">
    <div>
      <div class="text-lg font-extrabold">{name}</div>
      <p class="text-3.75 text-gray-50">
        {content}
      </p>
    </div>
    <button class="i-lc-chevron-down sm:hidden" type="button" />
  </div>
  <div
    class="flex flex-col bg-gray-10 py-4 px-6 space-y-6 sm:(space-y-0 flex-row items-center p-0 bg-white gap-8)"
  >
    <div class="flex justify-between items-center">
      <span class="font-semibold sm:hidden">웹사이트</span>
      <Switch class="sm:hidden" size="sm" bind:checked={website} />
      <Switch class="<sm:hidden" size="lg" bind:checked={website} />
    </div>
    <div class="flex justify-between items-center">
      <span class="font-semibold sm:hidden">이메일</span>
      <Switch class="sm:hidden" size="sm" bind:checked={email} />
      <Switch class="<sm:hidden" size="lg" bind:checked={email} />
    </div>
  </div>
</div>
