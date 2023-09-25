import * as cloudflare from '@pulumi/cloudflare';
import { account } from '$cloudflare/account';

const createZone = (domain: string) => {
  const zone = new cloudflare.Zone(domain, {
    accountId: account.id,
    zone: domain,
  });

  // spell-checker:disable-next-line
  new cloudflare.ZoneDnssec(domain, {
    zoneId: zone.id,
  });

  new cloudflare.ZoneSettingsOverride(domain, {
    zoneId: zone.id,
    settings: {
      alwaysUseHttps: 'on',
      automaticHttpsRewrites: 'on',
      ssl: 'flexible',

      earlyHints: 'on',
      zeroRtt: 'on',

      browserCacheTtl: 0,

      emailObfuscation: 'off',
      serverSideExclude: 'off',
      hotlinkProtection: 'off',

      securityHeader: {
        enabled: true,
        maxAge: 15_552_000,
        includeSubdomains: true,
        nosniff: true,
        preload: true,
      },
    },
  });

  return zone;
};

export const zones = {
  pnxl_site: createZone('pnxl.site'),
};

export const outputs = {};
