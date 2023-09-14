<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import SideMenu from '../SideMenu.svelte';
</script>

<Helmet title="나의 서랍" />

<h1 class="hidden text-xl font-bold mb-5 sm:block">나의 펜슬</h1>

<div class="flex gap-10">
  <SideMenu />

  <div class="w-full max-w-200">
    <h2 class="hidden text-xl font-bold mb-6 sm:block">나의 서랍</h2>
    <div
      class="bg-white py-8 px-6 space-y-8 text-3.75 sm:(px-8 border border-gray-30 rounded-2xl)"
    >
      북마크
    </div>
  </div>
</div>
