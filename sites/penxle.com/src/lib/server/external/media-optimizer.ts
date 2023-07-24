export const optimizeMedia = async (key: string) => {
  const resp = await fetch(`https://media-optimizer.pnxl.app/${key}`);

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
