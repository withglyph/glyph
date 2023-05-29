import { graphql } from '$houdini';

const prepareFileUpload = graphql(`
  mutation Lib_Utils_PrepareImageUploadMutation {
    prepareImageUpload {
      path
      presignedUrl
    }
  }
`);

const finalizeImageUpload = graphql(`
  mutation Lib_Utils_FinalizeImageUploadMutation(
    $input: FinalizeImageUploadInput!
  ) {
    finalizeImageUpload(input: $input) {
      path
    }
  }
`);

export const uploadImage = async (file: File) => {
  const resp = await prepareFileUpload.mutate(null);
  const { path, presignedUrl } = resp.data!.prepareImageUpload;

  await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
  });

  const finalizeResp = await finalizeImageUpload.mutate({
    input: {
      path,
      name: file.name,
    },
  });

  return `https://pnxl.net/${finalizeResp.data!.finalizeImageUpload.path}`;
};
