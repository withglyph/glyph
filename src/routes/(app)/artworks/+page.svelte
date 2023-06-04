<script lang="ts">
  import { graphql } from '$houdini';
  import { Button, Helmet, Image, Tooltip } from '$lib/components';
  import type { PageData } from './$houdini';
  import type { ChangeEventHandler } from 'svelte/elements';

  export let data: PageData;
  $: ({ ArtworksPage_Query } = data);

  const prepareImageUpload = graphql(`
    mutation ArtworksPage_PrepareImageUploadMutation {
      prepareImageUpload {
        path
        presignedUrl
      }
    }
  `);

  const finalizeImageUpload = graphql(`
    mutation ArtworksPage_FinalizeImageUploadMutation(
      $input: FinalizeImageUploadInput!
    ) {
      finalizeImageUpload(input: $input) {
        ...ArtworksPage_Query_images_insert @prepend
      }
    }
  `);

  let loading = false;
  let fileEl: HTMLInputElement;

  const handleUpload: ChangeEventHandler<HTMLInputElement> = async (event) => {
    const { files } = event.currentTarget;
    if (files?.length !== 1) {
      return;
    }

    try {
      loading = true;

      const resp = await prepareImageUpload.mutate(null);
      if (resp.data === null || resp.errors) {
        throw new Error('Failed to prepare image upload');
      }

      const { path, presignedUrl } = resp.data.prepareImageUpload;

      await fetch(presignedUrl, {
        method: 'PUT',
        body: files[0],
      });

      await finalizeImageUpload.mutate({
        input: { path, name: files[0].name },
      });
    } finally {
      loading = false;
    }
  };
</script>

<Helmet title="아트" />

<div class="mb-4 flex flex-col items-end">
  <Button {loading} on:click={() => fileEl.click()}>Upload</Button>
  <input
    bind:this={fileEl}
    class="hidden"
    accept="image/jpeg,image/png"
    type="file"
    on:change={handleUpload}
  />
</div>

<div class="grid grid-cols-4 gap-4">
  {#if $ArtworksPage_Query.data}
    {#each $ArtworksPage_Query.data.images as image (image.id)}
      <Tooltip message={image.id}>
        <Image
          class="aspect-1 w-full border rounded-3xl object-cover"
          $image={image}
        />
      </Tooltip>
    {/each}
  {:else}
    <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
    {#each Array.from({ length: 20 }) as _, index (index)}
      <div class="aspect-1 w-full border rounded-3xl bg-gray-200" />
    {/each}
  {/if}
</div>
