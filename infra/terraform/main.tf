module "aws" {
  source = "./aws"
}

module "cloudflare" {
  source = "./cloudflare"
}

module "vercel" {
  source = "./vercel"
}
