provider "aws" {
  region = "ap-northeast-2"

  default_tags {
    tags = { "ManagedBy" = "terraform" }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}
