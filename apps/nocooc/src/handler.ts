import iconv from 'iconv-lite';
import { decrypt } from './seed';

export const handle = async (data: Buffer) => {
  try {
    const buffer = data.subarray(4);
    decrypt(buffer);

    const slice = (offset: number, length: number) =>
      iconv.decode(buffer.subarray(offset, offset + length), 'euc-kr').trim();

    const txId = slice(64, 7);

    const amount = Number(slice(300, 13)) * (slice(313, 1) === '+' ? 1 : -1);
    const leftover = Number(slice(314, 13));

    const inBankCode = slice(340, 8);
    const inAccountNumber = slice(350, 16);
    const inMemo = slice(366, 20);

    const outBankCode = slice(386, 8);
    const outAccountNumber = slice(396, 16);
    const outMemo = slice(420, 20);

    const txKind = slice(440, 2);
    const txAt = slice(442, 14);

    console.log({
      txId,
      txKind,
      amount,
      leftover,
      txAt,
      inBankCode,
      inAccountNumber,
      inMemo,
      outBankCode,
      outAccountNumber,
      outMemo,
    });
  } catch (err) {
    console.error(err);
  }
};
