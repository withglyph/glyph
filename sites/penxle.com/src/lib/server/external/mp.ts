import { MP_URL } from '$env/static/private';

export const processMedia = async (key: string) => {
  const resp = await fetch(`${MP_URL}/${key}`);

  return (await resp.json()) as {
    name: string;
    format: string;
    fileSize: number;
    blobSize: number;
    width: number;
    height: number;
    path: string;
    hash: string;
    placeholder: string;
  };
};
