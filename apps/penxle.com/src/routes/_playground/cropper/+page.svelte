<script lang="ts">
  import { Slider } from '$lib/components/forms';

  let value: number;
</script>

<div class="flex flex-col grow center gap-4">
  <Slider class="w-50%" max={8} min={1} bind:value />
  <div>{value}</div>
</div>
