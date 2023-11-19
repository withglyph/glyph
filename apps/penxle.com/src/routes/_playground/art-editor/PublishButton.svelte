<script lang="ts">
  import ky from 'ky';
  import { graphql } from '$glitch';
  import { Button } from '$lib/components';
  import { trackable } from '$lib/svelte/store';
  import type { Artwork } from './types';

  export let artworks: Artwork[];

  const loading = trackable();

  const prepareImageUpload = graphql(`
    mutation SpacePublishArtworkPage_PublishButton_PrepareImageUpload_Mutation {
      prepareImageUpload {
        key
        presignedUrl
      }
    }
  `);

  const finalizeImageUpload = graphql(`
    mutation SpacePublishArtworkPage_PublishButton_FinalizeImageUpload_Mutation($input: FinalizeImageUploadInput!) {
      finalizeImageUpload(input: $input) {
        id
      }
    }
  `);

  const doUpload = async (file: File) => {
    const { key, presignedUrl } = await prepareImageUpload();
    await ky.put(presignedUrl, { body: file });
    return await finalizeImageUpload({ key, name: file.name });
  };

  const doPublish = async () => {
    await loading.track(async () => {
      const images = await Promise.all(artworks.map(async (v) => doUpload(v.file)));
      console.log(images.map((v) => v.id));
    });
  };
</script>

<Button loading={$loading} size="md" on:click={doPublish}>게시하기</Button>
