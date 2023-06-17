<script lang="ts">
  import { fragment, graphql } from '$houdini';
  import { Button } from '$lib/components';
  import { useMutation } from '$lib/houdini';
  import type { SpacePublishArtworkPage_PublishButton_space } from '$houdini';

  let _space: SpacePublishArtworkPage_PublishButton_space;
  export { _space as $space };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  $: space = fragment(
    _space,
    graphql(`
      fragment SpacePublishArtworkPage_PublishButton_space on Space {
        id
      }
    `)
  );

  const prepareImageUpload = useMutation(
    graphql(`
      mutation SpacePublishArtworkPage_PublishButton_PrepareImageUpload_Mutation(
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
      mutation SpacePublishArtworkPage_PublishButton_FinalizeImageUpload_Mutation(
        $input: FinalizeImageUploadInput!
      ) {
        finalizeImageUpload(input: $input) {
          id
          ...Image_image
        }
      }
    `)
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const doUpload = async (file: File) => {
    const { path, presignedUrl } = await prepareImageUpload({
      name: file.name,
    });

    await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
    });

    await finalizeImageUpload({ path });
  };
</script>

<Button>게시하기</Button>
