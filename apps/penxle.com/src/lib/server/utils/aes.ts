import { webcrypto } from 'node:crypto';
import * as R from 'radash';
import { env } from '$env/dynamic/private';

const getAESKey = R.memo(() =>
  webcrypto.subtle.importKey(
    'jwk',
    JSON.parse(Buffer.from(env.PRIVATE_AES_SECRET_JWK, 'base64').toString()),
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt'],
  ),
);

export const encryptAES = async (text: string) => {
  const key = await getAESKey();
  const nonce = webcrypto.getRandomValues(new Uint8Array(12));

  const encrypted = await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, key, new TextEncoder().encode(text));

  return {
    nonce: Buffer.from(nonce).toString('base64'),
    encrypted: Buffer.from(encrypted).toString('base64'),
  };
};

export const decryptAES = async (encrypted: string, nonce: string) => {
  const key = await getAESKey();
  const nonceByteArray = Buffer.from(nonce, 'base64');

  const decrypted = await webcrypto.subtle.decrypt(
    { name: 'AES-GCM', iv: nonceByteArray },
    key,
    Uint8Array.from(atob(encrypted), (c) => c.codePointAt(0) ?? 0),
  );

  return new TextDecoder().decode(decrypted);
};
