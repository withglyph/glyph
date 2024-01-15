import { webcrypto } from 'node:crypto';
import { env } from '$env/dynamic/private';

const key = await webcrypto.subtle.importKey(
  'jwk',
  JSON.parse(atob(env.PRIVATE_AES_SECRET_JWK)),
  { name: 'AES-GCM' },
  true,
  ['encrypt', 'decrypt'],
);

export const encryptAES = async (text: string) => {
  const nonce = webcrypto.getRandomValues(new Uint8Array(12));

  const encrypted = await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, key, new TextEncoder().encode(text));

  return {
    nonce: Buffer.from(nonce).toString('base64'),
    encrypted: Buffer.from(encrypted).toString('base64'),
  };
};

export const decryptAES = async (encrypted: string, nonce: string) => {
  const nonceByteArray = Buffer.from(nonce, 'base64');

  const decrypted = await webcrypto.subtle.decrypt(
    { name: 'AES-GCM', iv: nonceByteArray },
    key,
    Uint8Array.from(atob(encrypted), (c) => c.codePointAt(0) ?? 0),
  );

  return new TextDecoder().decode(decrypted);
};
