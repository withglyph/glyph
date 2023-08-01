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

export const createAccessToken = async (sessionId: bigint) => {
  const key = await loadPrivateKey();
  return await new jose.SignJWT({})
    .setProtectedHeader({ alg: jwk.alg! })
    .setJti(String(sessionId))
    .sign(key);
};

export const decodeAccessToken = async (bearerToken: string) => {
  const key = await loadPublicKey();
  const result = await jose.jwtVerify(bearerToken, key);
  return result.payload.jti ? BigInt(result.payload.jti) : undefined;
};
