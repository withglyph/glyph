resource "cloudflare_turnstile_widget" "turnstile" {
  account_id = cloudflare_account.this.id

  name    = "PENXLE"
  mode    = "managed"
  domains = [cloudflare_zone.penxle_com.zone]
}
