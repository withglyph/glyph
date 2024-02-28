<script lang="ts">
  import IconX from '~icons/tabler/x';
  import { Icon } from '$lib/components';
</script>

<button
  class="py-1.5 px-3 rounded-3xl border border-teal-500 bg-teal-50 text-teal-500 text-12-r flex items-center gap-1"
  type="button"
  on:click
>
  <slot />
  <Icon class="square-3.5" icon={IconX} />
</button>
