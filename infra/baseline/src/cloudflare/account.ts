import * as cloudflare from '@pulumi/cloudflare';

const { accounts } = await cloudflare.getAccounts({
  name: 'PENXLE',
});

export const account = {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  id: accounts[0].id!,
};

export const outputs = {};
