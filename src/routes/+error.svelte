<script lang="ts">
  import { page } from '$app/stores';
  import ForbiddenIcon from '$assets/status-codes/403.svg?component';
  import NotFoundIcon from '$assets/status-codes/404.svg?component';
  import InternalServerErrorIcon from '$assets/status-codes/500.svg?component';
  import { deserializeAppError, UnknownError } from '$lib/errors';

  const statusIcons = {
    403: ForbiddenIcon,
    404: NotFoundIcon,
    500: InternalServerErrorIcon,
  };

  const hasIcon = (value: number): value is keyof typeof statusIcons =>
    value in statusIcons;

  $: error = $page.error
    ? deserializeAppError($page.error)
    : new UnknownError();
  $: code = error.extra.code ?? $page.status;
  $: Icon = statusIcons[hasIcon(code) ? code : 500];
</script>

<div class="flex grow flex-col center">
  <svelte:component this={Icon} class="w-25" />

  <p class="mt-4 text-sm font-bold">
    {error.message}
  </p>

  {#if error instanceof UnknownError && error.cause}
    {@const { name, message, stack } = error.cause}
    <div
      class="mt-12 w-800px overflow-x-scroll border bg-gray-100 p-4 font-mono"
    >
      <div class="text-lg font-medium text-red-500">
        {name}: {message}
      </div>

      <div class="mt-4 whitespace-pre text-sm text-gray-500">
        {stack ?? 'Stacktrace not available'}
      </div>
    </div>
  {/if}
</div>
