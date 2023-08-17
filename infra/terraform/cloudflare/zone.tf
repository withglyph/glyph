resource "cloudflare_zone" "penxle_com" {
  zone       = "penxle.com"
  account_id = cloudflare_account.this.id
}

resource "cloudflare_zone" "penxle_io" {
  zone       = "penxle.io"
  account_id = cloudflare_account.this.id
}

resource "cloudflare_zone" "pnxl_cc" {
  zone       = "pnxl.cc"
  account_id = cloudflare_account.this.id
}

resource "cloudflare_zone" "pnxl_co" {
  zone       = "pnxl.co"
  account_id = cloudflare_account.this.id
}

resource "cloudflare_zone" "pnxl_net" {
  zone       = "pnxl.net"
  account_id = cloudflare_account.this.id
}

locals {
  zones = [
    cloudflare_zone.penxle_com,
    cloudflare_zone.penxle_io,
    cloudflare_zone.pnxl_cc,
    cloudflare_zone.pnxl_co,
    cloudflare_zone.pnxl_net,
  ]
}

resource "cloudflare_zone_dnssec" "each" {
  for_each = { for zone in local.zones : zone.zone => zone.id }

  zone_id = each.value
}

resource "cloudflare_zone_settings_override" "each" {
  for_each = { for zone in local.zones : zone.zone => zone.id }

  zone_id = each.value

  settings {
    always_use_https         = "on"
    automatic_https_rewrites = "on"
    ssl                      = "strict"

    early_hints = "on"
    zero_rtt    = "on"

    browser_cache_ttl = 0

    email_obfuscation   = "off"
    server_side_exclude = "off"
    hotlink_protection  = "off"

    security_header {
      enabled            = true
      max_age            = 15552000
      include_subdomains = true
      nosniff            = true
      preload            = true
    }
  }
}
