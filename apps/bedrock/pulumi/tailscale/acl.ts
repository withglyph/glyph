import * as tailscale from '@pulumi/tailscale';

new tailscale.Acl('penxle.io', {
  acl: JSON.stringify({
    acls: [{ action: 'accept', src: ['*'], dst: ['*:*'] }],

    autoApprovers: {
      routes: { '10.0.0.0/16': ['tag:bedrock'] },
      exitNode: ['tag:bedrock'],
    },

    tagOwners: {
      'tag:bedrock': ['autogroup:admin'],
      'tag:github-actions': ['autogroup:admin'],
    },
  }),
});
