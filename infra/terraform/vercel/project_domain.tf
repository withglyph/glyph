resource "vercel_project_domain" "staging_penxle_com" {
  project_id = vercel_project.penxle.id
  domain     = "staging.penxle.com"
}

resource "vercel_project_domain" "penxle_io" {
  project_id = vercel_project.company.id
  domain     = "penxle.io"
}

resource "vercel_project_domain" "help_penxle_com" {
  project_id = vercel_project.help.id
  domain     = "help.penxle.com"
}

resource "vercel_project_domain" "penxle_com" {
  project_id = vercel_project.landing.id
  domain     = "penxle.com"
}
