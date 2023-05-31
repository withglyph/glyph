import { MP_URL } from '$env/static/private';

export const processMedia = async (path: string, sizes: number[] = []) => {
  const resp = await fetch(`${MP_URL}/${path}?s=${sizes.join(',')}`);

  return (await resp.json()) as {
    path: string;
    size: number;
    sizes: number[];
    format: string;
    width: number;
    height: number;
    placeholder: string;
    color: string;
    hash: string;
  };
};
