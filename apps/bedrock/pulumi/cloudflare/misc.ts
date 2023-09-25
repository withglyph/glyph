import * as cloudflare from '@pulumi/cloudflare';
import { account } from '$cloudflare/account';

new cloudflare.TurnstileWidget('turnstile', {
  accountId: account.id,

  name: 'PENXLE',
  mode: 'managed',
  domains: ['penxle.com'],
});

export const outputs = {};
