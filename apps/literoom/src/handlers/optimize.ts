import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';

const S3 = new S3Client();

type Event = {
  key: string;
};

export const handler = async (event: Event) => {
  const key = event.key;

  const object = await S3.send(
    new GetObjectCommand({ Bucket: 'penxle-data', Key: key }),
  );

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const buffer = Buffer.from(await object.Body!.transformToByteArray());

  const image = sharp(buffer, { failOn: 'none' })
    .rotate()
    .flatten({ background: '#ffffff' });

  const output = await image
    .clone()
    .avif({ quality: 75, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  // await S3.send(
  //   new DeleteObjectCommand({ Bucket: 'penxle-uploads', Key: key }),
  // );

  await S3.send(
    new PutObjectCommand({
      Bucket: 'penxle-data',
      Key: `${key}.avif`,
      Body: output.data,
      ContentType: 'image/avif',
    }),
  );
};
