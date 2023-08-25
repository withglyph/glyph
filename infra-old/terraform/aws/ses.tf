resource "aws_sesv2_configuration_set" "penxle" {
  configuration_set_name = "penxle-1"
}

resource "aws_sesv2_email_identity" "penxle_com" {
  email_identity = "penxle.com"

  configuration_set_name = aws_sesv2_configuration_set.penxle.id
}

resource "aws_sesv2_email_identity_mail_from_attributes" "penxle_com" {
  email_identity   = aws_sesv2_email_identity.penxle_com.id
  mail_from_domain = "mail.penxle.com"
}
