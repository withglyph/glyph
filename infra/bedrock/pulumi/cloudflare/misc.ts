import * as cloudflare from '@pulumi/cloudflare';
import { account } from '$cloudflare/account';
import { zones } from '$cloudflare/zone';

new cloudflare.TurnstileWidget('turnstile', {
  accountId: account.id,

  name: 'PENXLE',
  mode: 'managed',
  domains: [zones.penxle_com.zone],
});

export const outputs = {};
