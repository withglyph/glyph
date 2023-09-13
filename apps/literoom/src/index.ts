import { S3Client, WriteGetObjectResponseCommand } from '@aws-sdk/client-s3';
import { withMetrics } from '@penxle/lambda/metrics';
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
sharp.concurrency(4);

export const handler = withMetrics(async (event: Event) => {
  const url = new URL(event.userRequest.url);

  const size = Number(url.searchParams.get('s') ?? 256);
  const quality = Number(url.searchParams.get('q') ?? 75);

  if (size <= 0 || quality <= 0 || quality > 100) {
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

  const resp = await fetch(event.getObjectContext.inputS3Url);
  if (!resp.ok) {
    await S3.send(
      new WriteGetObjectResponseCommand({
        RequestRoute: event.getObjectContext.outputRoute,
        RequestToken: event.getObjectContext.outputToken,
        StatusCode: 500,
        ErrorCode: 'FetchError',
        ErrorMessage: `Fetch failed with '${resp.status} ${resp.statusText}'`,
      }),
    );

    return { statusCode: 500 };
  }

  const started = performance.now();

  const input = await resp.arrayBuffer();
  const output = await sharp(input, { failOn: 'none' })
    .resize({
      width: size,
      height: size,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .webp({ quality })
    .toBuffer();

  const finished = performance.now();

  await S3.send(
    new WriteGetObjectResponseCommand({
      RequestRoute: event.getObjectContext.outputRoute,
      RequestToken: event.getObjectContext.outputToken,
      Body: output,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable',
      Metadata: {
        Elapsed: String((finished - started).toFixed(2)),
        Ratio: String((output.byteLength / input.byteLength).toFixed(2)),
      },
    }),
  );

  return { statusCode: 200 };
});
