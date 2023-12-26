import type { SQSHandler } from 'aws-lambda';

export const handler: SQSHandler = async (event) => {
  for (const record of event.Records) {
    const buffer = Buffer.from(record.body, 'base64');
    console.log(buffer);
  }
};
