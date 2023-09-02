import { S3Client, WriteGetObjectResponseCommand } from '@aws-sdk/client-s3';
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

export const handler = async (event: Event) => {
  const url = new URL(event.userRequest.url);

  const size = Math.min(Number(url.searchParams.get('s')), 8192);
  const quality = Math.min(Number(url.searchParams.get('q') ?? 75), 90);

  if (!size || !quality) {
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

  const input = await resp.arrayBuffer();
  const output = await sharp(input, { failOn: 'none' })
    .resize({
      width: size,
      height: size,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality })
    .toBuffer();

  await S3.send(
    new WriteGetObjectResponseCommand({
      RequestRoute: event.getObjectContext.outputRoute,
      RequestToken: event.getObjectContext.outputToken,
      Body: output,
      ContentType: 'image/webp',
    }),
  );

  return { statusCode: 200 };
};
