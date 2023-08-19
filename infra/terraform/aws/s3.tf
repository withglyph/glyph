resource "aws_s3_bucket" "penxle_data" {
  bucket = "penxle-data"
}

resource "aws_s3_bucket" "penxle_uploads" {
  bucket = "penxle-uploads"
}

resource "aws_s3_bucket_cors_configuration" "penxle_uploads" {
  bucket = aws_s3_bucket.penxle_uploads.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT"]
    allowed_origins = [
      "https://staging.penxle.com",
      "https://*.penxle.dev",
      "http://127.0.0.1:4000"
    ]
    max_age_seconds = 3600
  }
}
