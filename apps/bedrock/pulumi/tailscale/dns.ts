import * as tailscale from '@pulumi/tailscale';

new tailscale.DnsNameservers('penxle.io', {
  nameservers: ['1.1.1.1', '1.0.0.1'],
});
