import * as jose from 'jose';
import { memo } from 'radash';
import { PRIVATE_JWK } from '$env/static/private';

const jwk = JSON.parse(
  Buffer.from(PRIVATE_JWK, 'base64').toString(),
) as jose.JWK;

const loadPublicKey = memo(async () =>
  jose.importJWK({ ...jwk, d: undefined }),
);
const loadPrivateKey = memo(async () => jose.importJWK(jwk));

export const createAccessToken = async (sessionId: string) => {
  const key = await loadPrivateKey();
  return await new jose.SignJWT({})
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .setProtectedHeader({ alg: jwk.alg! })
    .setJti(sessionId)
    .sign(key);
};

export const decodeAccessToken = async (bearerToken: string) => {
  const key = await loadPublicKey();
  const result = await jose.jwtVerify(bearerToken, key);
  return result.payload.jti;
};
