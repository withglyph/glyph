import { createId } from '$lib/utils';
import { createS3ObjectKey, s3PutObject } from '../external/aws';
import { finalizeMedia } from '../external/media';
import type { InteractiveTransactionClient } from '../database';

export const persistImage = async (
  db: InteractiveTransactionClient,
  name: string,
  buffer: Buffer,
) => {
  const key = createS3ObjectKey();
  await s3PutObject(key, name, buffer);

  const {
    format,
    fileSize,
    blobSize,
    width,
    height,
    path,
    color,
    placeholder,
    hash,
  } = await finalizeMedia(key);

  const { id } = await db.image.create({
    select: { id: true },
    data: {
      id: createId(),
      name,
      format,
      fileSize,
      blobSize,
      width,
      height,
      path,
      color,
      placeholder,
      hash,
    },
  });

  return id;
};
