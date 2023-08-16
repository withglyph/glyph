terraform {
  backend "s3" {
    bucket = "penxle-tfstate"
    key    = "terraform.tfstate"
    region = "ap-northeast-2"
  }
}
