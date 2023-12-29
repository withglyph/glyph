import iconv from 'iconv-lite';
import { decrypt, encrypt } from './seed';

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

  const txId = slice(64, 7);

  const amount = Number(slice(300, 13)) * (slice(313, 1) === '+' ? 1 : -1);
  const leftover = Number(slice(314, 13));
  const memo = slice(366, 20);

  const txKind = slice(440, 2);
  const txAt = slice(442, 14);

  console.log({
    txId,
    txKind,
    amount,
    leftover,
    txAt,
    memo,
  });

  buffer.set(Buffer.from('0210'), 39);
  buffer.set(Buffer.from('000'), 47);

  encrypt(buffer);

  return data;
};
