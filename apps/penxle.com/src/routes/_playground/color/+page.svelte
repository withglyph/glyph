<script lang="ts">
  import { ColorPicker } from '$lib/components';

  let hex = '#FF0000';
</script>

<ColorPicker on:input={(event) => console.log(event.detail.hex)} bind:hex />
