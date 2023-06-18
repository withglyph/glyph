<script lang="ts">
  import FileImage from './FileImage.svelte';
  import FileImporter from './FileImporter.svelte';

  export let files: File[];
</script>

<div class="h-100 flex center gap-4 overflow-x-auto bg-gray-100">
  {#each files as file (file)}
    <div class="relative square-80 flex-none overflow-hidden rounded bg-white">
      <FileImage class="square-full object-contain" {file} />
      <button
        class="absolute right-2 top-2 square-8 flex center rounded-full bg-black/50"
        type="button"
        on:click={() => (files = files.filter((f) => f !== file))}
      >
        <span class="i-lc-x square-6 text-white" />
      </button>
    </div>
  {/each}

  <div class="square-80 flex-none border-4 rounded border-dashed">
    <label
      class="square-full flex cursor-pointer center bg-white text-sm transition hover:bg-gray-50"
      for="file"
    >
      <span class="i-lc-plus-circle square-8 text-gray-300" />
    </label>
  </div>
</div>

<FileImporter bind:files />
