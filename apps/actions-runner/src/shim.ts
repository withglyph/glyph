import crypto from 'node:crypto';
import { createRequire } from 'node:module';

// @ts-expect-error shims
globalThis.crypto = crypto;
globalThis.require = createRequire(import.meta.url);
