<script lang="ts">
  import { ColorPicker } from '$lib/components';

  let hex = '#FF0000';
</script>

<ColorPicker onChange={() => console.log(hex)} bind:hex />
