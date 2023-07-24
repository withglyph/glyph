import sharp from 'sharp';

export const optimize = async (input: Buffer) => {
  const image = sharp(input, { failOn: 'none' })
    .rotate()
    .flatten({ background: '#ffffff' });

  const metadata = await image.metadata();

  const getOutput = async () => {
    return await image
      .clone()
      .webp({ quality: 80, effort: 6 })
      .toBuffer({ resolveWithObject: true });
  };

  const getHash = async () => {
    const size = 16;

    const raw = await image
      .clone()
      .greyscale()
      .resize(size + 1, size, { fit: 'fill' })
      .raw()
      .toBuffer();

    let difference = '';
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const left = raw[row * (size + 1) + col];
        const right = raw[row * (size + 1) + col + 1];
        difference += left < right ? 1 : 0;
      }
    }

    let hash = '';
    for (let i = 0; i < difference.length; i += 4) {
      const chunk = difference.slice(i, i + 4);
      hash += Number.parseInt(chunk, 2).toString(16);
    }

    return hash;
  };

  const getPlaceholder = async () => {
    const buffer = await image
      .clone()
      .resize(32, 32, { fit: 'inside' })
      .blur(4)
      .webp({ quality: 100, effort: 6 })
      .toBuffer();

    return `data:image/webp;base64,${buffer.toString('base64')}`;
  };

  const [output, hash, placeholder] = await Promise.all([
    getOutput(),
    getHash(),
    getPlaceholder(),
  ]);

  return {
    buffer: output.data,
    metadata: {
      format: metadata.format,
      fileSize: metadata.size,
      blobSize: output.info.size,
      width: output.info.width,
      height: output.info.height,
      hash,
      placeholder,
    },
  };
};
