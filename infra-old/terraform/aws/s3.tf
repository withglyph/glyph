resource "aws_s3_bucket" "penxle_artifacts" {
  bucket = "penxle-artifacts"
}

resource "aws_s3_bucket" "penxle_data" {
  bucket = "penxle-data"
}

resource "aws_s3_access_point" "penxle_data" {
  bucket = aws_s3_bucket.penxle_data.id
  name   = "penxle-data"
}

resource "aws_s3control_object_lambda_access_point" "penxle_images" {
  name = "penxle-images"

  configuration {
    supporting_access_point = aws_s3_access_point.penxle_data.arn

    transformation_configuration {
      actions = ["GetObject"]

      content_transformation {
        aws_lambda {
          function_arn = aws_lambda_function.literoom_transform.arn
        }
      }
    }
  }
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

resource "aws_s3_bucket_notification" "penxle_uploads" {
  bucket = aws_s3_bucket.penxle_uploads.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.literoom_finalize.arn
    id                  = "literoom-finalize"

    events        = ["s3:ObjectCreated:*"]
    filter_prefix = "images/"
  }

  depends_on = [aws_lambda_permission.literoom_finalize]
}
