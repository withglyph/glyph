resource "cloudflare_record" "penxle_com" {
  zone_id = cloudflare_zone.penxle_com.id

  type    = "CNAME"
  name    = "penxle.com"
  value   = "cname.vercel-dns.com"
  comment = "Vercel"
}

resource "cloudflare_record" "help_penxle_com" {
  zone_id = cloudflare_zone.penxle_com.id

  type    = "CNAME"
  name    = "help.penxle.com"
  value   = "cname.vercel-dns.com"
  comment = "Vercel"
}

resource "cloudflare_record" "idea_penxle_com" {
  zone_id = cloudflare_zone.penxle_com.id

  type    = "CNAME"
  name    = "idea.penxle.com"
  value   = "cname.frill.co"
  comment = "Frill"
}

resource "cloudflare_record" "staging_penxle_com" {
  zone_id = cloudflare_zone.penxle_com.id

  type    = "CNAME"
  name    = "staging.penxle.com"
  value   = "cname.vercel-dns.com"
  comment = "Vercel"
}

resource "cloudflare_record" "status_penxle_com" {
  zone_id = cloudflare_zone.penxle_com.id

  type    = "CNAME"
  name    = "status.penxle.com"
  value   = "statuspage.betteruptime.com"
  comment = "Better Stack (Uptime)"
}

resource "cloudflare_record" "www_penxle_com" {
  zone_id = cloudflare_zone.penxle_com.id

  type    = "AAAA"
  name    = "www.penxle.com"
  value   = "100::"
  proxied = true
  comment = "Cloudflare (Page Rules)"
}

resource "cloudflare_record" "penxle_com_txt_google_site_verification" {
  zone_id = cloudflare_zone.penxle_com.id

  type    = "TXT"
  name    = "penxle.com"
  value   = "google-site-verification=bwCGvefwzolnCCx3lMbeJ0VmSp9sawDrbcaQ2WgehJo"
  comment = "Google Search Console"
}

resource "cloudflare_record" "mail_penxle_com_mx_10" {
  zone_id = cloudflare_zone.penxle_com.id

  type     = "MX"
  name     = "mail.penxle.com"
  value    = "feedback-smtp.ap-northeast-2.amazonses.com"
  priority = 10
  comment  = "Amazon SES"
}

resource "cloudflare_record" "mail_penxle_com_txt_spf" {
  zone_id = cloudflare_zone.penxle_com.id

  type    = "TXT"
  name    = "mail.penxle.com"
  value   = "v=spf1 include:amazonses.com ~all"
  comment = "Amazon SES"
}

resource "cloudflare_record" "_domainkey_penxle_com" {
  for_each = toset(var.sesv2_email_identity_penxle_com_dkim_tokens)

  zone_id = cloudflare_zone.penxle_com.id

  type    = "CNAME"
  name    = "${each.value}._domainkey.penxle.com"
  value   = "${each.value}.dkim.amazonses.com"
  comment = "Amazon SES"
}

resource "cloudflare_record" "penxle_io" {
  zone_id = cloudflare_zone.penxle_io.id

  type    = "CNAME"
  name    = "penxle.io"
  value   = "cname.vercel-dns.com"
  comment = "Vercel"
}

resource "cloudflare_record" "mail_penxle_io" {
  zone_id = cloudflare_zone.penxle_io.id

  type    = "CNAME"
  name    = "mail.penxle.io"
  value   = "ghs.googlehosted.com"
  comment = "Google Workspace"
}

resource "cloudflare_record" "www_penxle_io" {
  zone_id = cloudflare_zone.penxle_io.id

  type    = "AAAA"
  name    = "www.penxle.io"
  value   = "100::"
  proxied = true
  comment = "Cloudflare (Page Rules)"
}

resource "cloudflare_record" "mail_penxle_io_mx_1" {
  zone_id = cloudflare_zone.penxle_io.id

  type     = "MX"
  name     = "penxle.io"
  value    = "aspmx.l.google.com"
  priority = 1
  comment  = "Google Workspace"
}

resource "cloudflare_record" "mail_penxle_io_mx_5_1" {
  zone_id = cloudflare_zone.penxle_io.id

  type     = "MX"
  name     = "penxle.io"
  value    = "alt1.aspmx.l.google.com"
  priority = 5
  comment  = "Google Workspace"
}

resource "cloudflare_record" "mail_penxle_io_mx_5_2" {
  zone_id = cloudflare_zone.penxle_io.id

  type     = "MX"
  name     = "penxle.io"
  value    = "alt2.aspmx.l.google.com"
  priority = 5
  comment  = "Google Workspace"
}

resource "cloudflare_record" "mail_penxle_io_mx_10_1" {
  zone_id = cloudflare_zone.penxle_io.id

  type     = "MX"
  name     = "penxle.io"
  value    = "alt3.aspmx.l.google.com"
  priority = 10
  comment  = "Google Workspace"
}

resource "cloudflare_record" "mail_penxle_io_mx_10_2" {
  zone_id = cloudflare_zone.penxle_io.id

  type     = "MX"
  name     = "penxle.io"
  value    = "alt4.aspmx.l.google.com"
  priority = 10
  comment  = "Google Workspace"
}

resource "cloudflare_record" "penxle_io_txt_spf1" {
  zone_id = cloudflare_zone.penxle_io.id

  type    = "TXT"
  name    = "penxle.io"
  value   = "v=spf1 include:_spf.google.com ~all"
  comment = "Google Workspace"
}

resource "cloudflare_record" "pnxl_cc" {
  zone_id = cloudflare_zone.pnxl_cc.id

  type    = "AAAA"
  name    = "pnxl.cc"
  value   = "100::"
  proxied = true
  comment = "Cloudflare (Page Rules)"
}

resource "cloudflare_record" "pnxl_net" {
  zone_id = cloudflare_zone.pnxl_net.id

  type    = "CNAME"
  name    = "pnxl.net"
  value   = "penxle-data.b-cdn.net"
  comment = "bunny.net"
}
