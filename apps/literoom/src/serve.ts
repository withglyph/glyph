import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import {
  GetObjectCommand,
  S3Client,
  WriteGetObjectResponseCommand,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';

type Event = {
  getObjectContext: {
    inputS3Url: string;
    outputRoute: string;
    outputToken: string;
  };
  userRequest: {
    url: string;
  };
};

const S3 = new S3Client();
const LAMBDA = new LambdaClient();
const SIZES = new Set([32, 64, 128, 256, 512, 1024, 2048, 4096, 8192]);

export const handler = async (event: Event) => {
  const url = new URL(event.userRequest.url);

  const key = url.pathname.slice(1);
  const size = Number(url.searchParams.get('s'));

  if (!SIZES.has(size)) {
    await S3.send(
      new WriteGetObjectResponseCommand({
        RequestRoute: event.getObjectContext.outputRoute,
        RequestToken: event.getObjectContext.outputToken,
        StatusCode: 400,
        ErrorCode: 'InvalidRequest',
      }),
    );

    return { statusCode: 400 };
  }

  try {
    const object = await S3.send(
      new GetObjectCommand({
        Bucket: 'penxle-caches',
        Key: `${key}/${size}.avif`,
      }),
    );

    await S3.send(
      new WriteGetObjectResponseCommand({
        RequestRoute: event.getObjectContext.outputRoute,
        RequestToken: event.getObjectContext.outputToken,
        Body: object.Body,
        CacheControl: 'public, max-age=31536000, immutable',
        ContentType: object.ContentType,
        Metadata: object.Metadata,
      }),
    );

    return { statusCode: 200 };
  } catch {
    try {
      const object = await S3.send(
        new GetObjectCommand({
          Bucket: 'penxle-data',
          Key: key,
        }),
      );

      await LAMBDA.send(
        new InvokeCommand({
          FunctionName: 'literoom-shrink',
          InvocationType: 'Event',
          Payload: JSON.stringify({ key, size }),
        }),
      );

      const started = performance.now();

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const input = await object.Body!.transformToByteArray();
      const output = await sharp(input, { failOn: 'none' })
        .resize({
          width: size,
          height: size,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .webp({ quality: 75, effort: 2 })
        .toBuffer();

      const finished = performance.now();

      await S3.send(
        new WriteGetObjectResponseCommand({
          RequestRoute: event.getObjectContext.outputRoute,
          RequestToken: event.getObjectContext.outputToken,
          Body: object.Body,
          CacheControl: 'public, max-age=60, must-revalidate',
          ContentType: 'image/webp',
          Metadata: {
            Elapsed: String(((finished - started) / 1000).toFixed(2)),
            Ratio: String((output.byteLength / input.byteLength).toFixed(2)),
          },
        }),
      );

      return { statusCode: 200 };
    } catch (err) {
      await S3.send(
        new WriteGetObjectResponseCommand({
          RequestRoute: event.getObjectContext.outputRoute,
          RequestToken: event.getObjectContext.outputToken,
          StatusCode: 500,
          ErrorCode: 'RequestFailed',
          ErrorMessage: `Request failed with '${err}'`,
        }),
      );

      return { statusCode: 500 };
    }
  }
};
