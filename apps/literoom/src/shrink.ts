import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { SIZES } from './const';
import type { S3EventRecord, S3Handler } from 'aws-lambda';

sharp.concurrency(4);
const S3 = new S3Client();

export const handler: S3Handler = async (event) => {
  await Promise.all(event.Records.map((v) => handle(v)));
};

const handle = async (record: S3EventRecord) => {
  const bucket = record.s3.bucket.name;
  const key = decodeURIComponent(record.s3.object.key);

  const object = await S3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const input = await object.Body!.transformToByteArray();

  const transform = async (size: number) => {
    const started = performance.now();

    const output = await sharp(input, { failOn: 'none' })
      .resize({
        width: size,
        height: size,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .avif({ quality: 75, effort: 9 })
      .toBuffer();

    const finished = performance.now();

    await S3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: `shrink/${key}/${size}.avif`,
        Body: output,
        ContentType: 'image/avif',
        Metadata: {
          Elapsed: String((finished - started).toFixed(2)),
          Ratio: String((output.byteLength / input.byteLength).toFixed(2)),
        },
      }),
    );
  };

  await Promise.all(SIZES.map(async (size) => await transform(size)));
};
