import { argon2id } from 'hash-wasm';

export const hashPassword = async (password: string) => {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);

  return await argon2id({
    password,
    salt,
    parallelism: 1,
    iterations: 256,
    memorySize: 512,
    hashLength: 32,
    outputType: 'encoded',
  });
};
