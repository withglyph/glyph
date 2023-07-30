<script lang="ts">
  import { Helmet } from '$lib/components';
  import TextInput from './TextInput.svelte';
</script>

<Helmet title="펜슬컴퍼니" />

<div class="pointer-events-none flex grow select-none center">
  <div class="flex items-center gap-4">
    <div class="i-px-logo square-24" />
    <div class="text-20 font-black">펜슬컴퍼니</div>
  </div>
</div>

<TextInput class="w-full" />
