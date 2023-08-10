resource "aws_vpc" "penxle" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "penxle"
  }
}
