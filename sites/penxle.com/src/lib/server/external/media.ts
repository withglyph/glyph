export const finalizeMedia = async (key: string) => {
  const resp = await fetch('https://media.pnxl.co/finalize', {
    method: 'POST',
    body: JSON.stringify({ key }),
  });

  return (await resp.json()) as {
    name: string;
    format: string;
    fileSize: number;
    blobSize: number;
    width: number;
    height: number;
    path: string;
    color: string;
    hash: string;
  };
};
