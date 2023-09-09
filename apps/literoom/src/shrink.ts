import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';

sharp.concurrency(4);
const S3 = new S3Client();
const DDB = new DynamoDBClient();

type Event = {
  key: string;
  size: number;
};

export const handler = async (event: Event) => {
  const item = await DDB.send(
    new GetItemCommand({
      TableName: 'literoom-shrink',
      Key: {
        key: { S: event.key },
        size: { N: String(event.size) },
      },
    }),
  );

  if (item.Item) {
    return;
  }

  await DDB.send(
    new PutItemCommand({
      TableName: 'literoom-shrink',
      Item: {
        key: { S: event.key },
        size: { N: String(event.size) },
        ttl: { N: String(Math.ceil(Date.now() / 1000) + 6 * 60 * 60) },
      },
    }),
  );

  try {
    const object = await S3.send(
      new GetObjectCommand({
        Bucket: 'penxle-data',
        Key: event.key,
      }),
    );

    const started = performance.now();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const input = await object.Body!.transformToByteArray();
    const output = await sharp(input, { failOn: 'none' })
      .resize({
        width: event.size,
        height: event.size,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .avif({ quality: 50, effort: 6 })
      .toBuffer();

    const finished = performance.now();

    await S3.send(
      new PutObjectCommand({
        Bucket: 'penxle-caches',
        Key: `${event.key}/${event.size}.avif`,
        Body: output,
        ContentType: 'image/avif',
        Metadata: {
          Elapsed: String(((finished - started) / 1000).toFixed(2)),
          Ratio: String((output.byteLength / input.byteLength).toFixed(2)),
        },
      }),
    );
  } finally {
    await DDB.send(
      new DeleteItemCommand({
        TableName: 'literoom-shrink',
        Key: {
          key: { S: event.key },
          size: { N: String(event.size) },
        },
      }),
    );
  }
};
