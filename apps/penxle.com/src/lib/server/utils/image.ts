import { aws } from '$lib/server/external-api';
import { createS3ObjectKey } from './id';
import type { InteractiveTransactionClient } from '../database';

export const uploadImage = async (
  db: InteractiveTransactionClient,
  name: string,
  buffer: Buffer,
) => {
  const key = createS3ObjectKey('images');
  await aws.s3PutObject({
    bucket: 'penxle-uploads',
    key,
    buffer,
    meta: { name },
  });

  return '';
  // return await finalizeImage(db, key);
};

// type FinalizeResult =
//   | {
//       name: string;
//       format: string;
//       fileSize: number;
//       blobSize: number;
//       width: number;
//       height: number;
//       path: string;
//       color: string;
//       placeholder: string;
//       hash: string;
//     }
//   | { error: string };

// export const finalizeImage = async (
//   db: InteractiveTransactionClient,
//   key: string,
// ) => {
//   const { id } = await db.image.create({
//     select: { id: true },
//     data: {
//       id: createId(),
//       ...item,
//     },
//   });

//   return id;
// };
