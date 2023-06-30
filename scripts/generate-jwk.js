#!/usr/bin/env node

import * as jose from 'jose';

if (!process.argv[2]) {
  console.error('Usage: node scripts/generate-jwk.js <kid>');
  process.exit(1);
}

const alg = 'EdDSA';
const { privateKey } = await jose.generateKeyPair(alg);

const jwk = await jose.exportJWK(privateKey);

jwk.alg = alg;
jwk.kid = process.argv[2];

console.log('JWK representation:');
console.log(JSON.stringify(jwk, null, 2));

console.log();
console.log('Environment variable representation:');
console.log(Buffer.from(JSON.stringify(jwk)).toString('base64'));
