<script lang="ts">
  import { Button, Helmet, Image, Tooltip } from '$lib/components';
  import { graphql, useMutation, useQuery } from '$lib/houdini';
  import { trackable } from '$lib/svelte/store';
  import type { ChangeEventHandler } from 'svelte/elements';

  $: query = useQuery(
    graphql(`
      query ArtworksPage_Query @load {
        images {
          id
          ...Image_image
        }
      }
    `)
  );

  const prepareImageUpload = useMutation(
    graphql(`
      mutation ArtworksPage_PrepareImageUpload_Mutation(
        $input: PrepareImageUploadInput!
      ) {
        prepareImageUpload(input: $input) {
          path
          presignedUrl
        }
      }
    `)
  );

  const finalizeImageUpload = useMutation(
    graphql(`
      mutation ArtworksPage_FinalizeImageUpload_Mutation(
        $input: FinalizeImageUploadInput!
      ) {
        finalizeImageUpload(input: $input) {
          __typename
        }
      }
    `)
  );

  let loading = trackable();
  let fileEl: HTMLInputElement;

  const handleUpload: ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.currentTarget.files?.[0];
    if (!file) {
      return;
    }

    await loading.track(async () => {
      const { path, presignedUrl } = await prepareImageUpload({
        name: file.name,
      });

      await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
      });

      await finalizeImageUpload({ path });
    });
  };
</script>

<Helmet title="아트" />

<div class="mb-4 flex flex-col items-end">
  <Button loading={$loading} on:click={() => fileEl.click()}>Upload</Button>
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
