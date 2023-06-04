<script lang="ts">
  import { graphql } from '$houdini';
  import { Button, Helmet, Image, Tooltip } from '$lib/components';
  import { useQuery } from '$lib/houdini';
  import type { PageData } from './$houdini';
  import type { ChangeEventHandler } from 'svelte/elements';

  export let data: PageData;
  $: query = useQuery(data.ArtworksPage_Query);

  const prepareImageUpload = graphql(`
    mutation ArtworksPage_PrepareImageUpload_Mutation(
      $input: PrepareImageUploadInput!
    ) {
      prepareImageUpload(input: $input) {
        path
        presignedUrl
      }
    }
  `);

  const finalizeImageUpload = graphql(`
    mutation ArtworksPage_FinalizeImageUpload_Mutation(
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

      const resp = await prepareImageUpload.mutate({
        input: { name: files[0].name },
      });

      if (resp.data === null || resp.errors) {
        throw new Error('Failed to prepare image upload');
      }

      const { path, presignedUrl } = resp.data.prepareImageUpload;

      await fetch(presignedUrl, {
        method: 'PUT',
        body: files[0],
      });

      await finalizeImageUpload.mutate({
        input: { path },
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
  {#each $query.images as image (image.id)}
    <Tooltip message={image.id}>
      <Image
        class="aspect-1 w-full border rounded-3xl object-cover"
        $image={image}
      />
    </Tooltip>
  {/each}
</div>
