import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import Slack from '@slack/bolt';
import dayjs from 'dayjs';
import iconv from 'iconv-lite';
import { decrypt, encrypt } from './seed';

const ddb = new DynamoDBClient();
const slack = new Slack.App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const kindMap: Record<string, string> = {
  '01': '입금',
  '40': '출금',
};

export const handle = async (data: Buffer) => {
  const buffer = data.subarray(4);
  decrypt(buffer);

  const slice = (offset: number, length: number) =>
    iconv.decode(buffer.subarray(offset, offset + length), 'euc-kr').trim();

  const payloadKind = slice(39, 4);
  if (payloadKind !== '0200') {
    console.log(iconv.decode(buffer, 'euc-kr'));
    return;
  }

  const seq = slice(64, 7);

  const amount = slice(300, 13);
  const leftover = slice(314, 13);
  const memo = slice(366, 20);

  const kind = slice(440, 2);
  const date = slice(442, 8);
  const time = slice(450, 6);

  const key = `${date}${seq}`;
  const dt = dayjs(`${date}${time}`, 'YYYYMMDDHHmmss').subtract(9, 'hour');

  try {
    await ddb.send(
      new PutItemCommand({
        TableName: 'cashflow',
        Item: {
          id: { S: key },
          kind: { S: kind },
          amount: { N: amount },
          leftover: { N: leftover },
          memo: { S: memo },
          dt: { S: dt.toISOString() },
        },
        ConditionExpression: 'attribute_not_exists(id)',
      }),
    );

    console.log(`${key}: SuccessfullyCreated`);

    await slack.client.chat.postMessage({
      channel: 'cashflow',
      attachments: [
        {
          color: '#36a64f',
          fallback: `[${kindMap[kind] ?? kind}] ${Number(amount).toLocaleString()}원 (${memo})`,
          fields: [
            { title: '거래 구분', value: kindMap[kind] ?? kind, short: true },
            { title: '적요', value: memo, short: true },
            { title: '거래 금액', value: `${Number(amount).toLocaleString()}원`, short: true },
            { title: '거래 후 잔액', value: `${Number(leftover).toLocaleString()}원`, short: true },
          ],
          footer: `SEQ: ${seq}`,
          ts: dt.unix().toString(),
        },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(`${key}: ${err.name}`);

    if (err.name !== 'ConditionalCheckFailedException') {
      throw err;
    }
  }

  buffer.set(Buffer.from('0210'), 39);
  buffer.set(Buffer.from('000'), 47);

  encrypt(buffer);

  return data;
};
