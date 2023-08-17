resource "cloudflare_ruleset" "penxle_com_dynamic_redirect" {
  zone_id = cloudflare_zone.penxle_com.id
  kind    = "zone"
  name    = "redirects"
  phase   = "http_request_dynamic_redirect"

  rules {
    description = "Redirect www to apex"

    action     = "redirect"
    expression = "(http.host eq \"www.penxle.com\")"

    action_parameters {
      from_value {
        status_code           = 308
        preserve_query_string = true

        target_url {
          expression = "concat(\"https://penxle.com\", http.request.uri.path)"
        }
      }
    }
  }
}

resource "cloudflare_ruleset" "penxle_io_dynamic_redirect" {
  zone_id = cloudflare_zone.penxle_io.id
  kind    = "zone"
  name    = "redirects"
  phase   = "http_request_dynamic_redirect"

  rules {
    description = "Redirect www to apex"

    action     = "redirect"
    expression = "(http.host eq \"www.penxle.io\")"

    action_parameters {
      from_value {
        status_code           = 308
        preserve_query_string = true

        target_url {
          expression = "concat(\"https://penxle.io\", http.request.uri.path)"
        }
      }
    }
  }
}

resource "cloudflare_ruleset" "pnxl_cc_dynamic_redirect" {
  zone_id = cloudflare_zone.pnxl_cc.id
  kind    = "zone"
  name    = "redirects"
  phase   = "http_request_dynamic_redirect"

  rules {
    description = "Redirect root to penxle.com"

    action     = "redirect"
    expression = "(http.host eq \"pnxl.cc\" and http.request.uri.path eq \"/\")"

    action_parameters {
      from_value {
        status_code = 303

        target_url {
          value = "https://penxle.com"
        }
      }
    }
  }

  rules {
    description = "Redirect shorturls to penxle.com"

    action     = "redirect"
    expression = "(http.host eq \"pnxl.cc\")"

    action_parameters {
      from_value {
        status_code = 303

        target_url {
          expression = "concat(\"https://penxle.com/s\", http.request.uri.path)"
        }
      }
    }
  }
}
