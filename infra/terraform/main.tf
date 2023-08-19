module "aws" {
  source = "./aws"
}

module "cloudflare" {
  source = "./cloudflare"

  sesv2_email_identity_penxle_com_dkim_tokens = module.aws.sesv2_email_identity_penxle_com_dkim_tokens
}

module "vercel" {
  source = "./vercel"
}
