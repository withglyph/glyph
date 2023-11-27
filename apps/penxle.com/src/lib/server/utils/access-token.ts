import * as jose from 'jose';
import * as R from 'radash';
import { env } from '$env/dynamic/private';

const loadJwk = R.memo(() => JSON.parse(Buffer.from(env.PRIVATE_JWK, 'base64').toString()) as jose.JWK);

const loadPublicKey = R.memo(async () => jose.importJWK({ ...loadJwk(), d: undefined }));
const loadPrivateKey = R.memo(async () => jose.importJWK(loadJwk()));

export const createAccessToken = async (sessionId: string) => {
  const key = await loadPrivateKey();
  return await new jose.SignJWT({})
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .setProtectedHeader({ alg: loadJwk().alg! })
    .setJti(sessionId)
    .sign(key);
};

export const decodeAccessToken = async (bearerToken: string) => {
  const key = await loadPublicKey();
  const result = await jose.jwtVerify(bearerToken, key);
  return result.payload.jti;
};
