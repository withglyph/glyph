import * as tailscale from '@pulumi/tailscale';

const authKey = new tailscale.TailnetKey('penxle.io', {
  reusable: true,
  ephemeral: true,
  tags: ['tag:bedrock'],
});

export const tailnet = {
  authKey: authKey.key,
};
