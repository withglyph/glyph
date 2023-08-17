resource "aws_vpc" "penxle" {
  cidr_block = "10.0.0.0/16"

  enable_dns_hostnames = true

  tags = { Name = "penxle" }
}

resource "aws_subnet" "public_az1" {
  vpc_id = aws_vpc.penxle.id

  cidr_block        = "10.0.100.0/22"
  availability_zone = "ap-northeast-2a"

  map_public_ip_on_launch = true

  tags = { Name = "public-az1" }
}

resource "aws_subnet" "public_az2" {
  vpc_id = aws_vpc.penxle.id

  cidr_block        = "10.0.104.0/22"
  availability_zone = "ap-northeast-2b"

  map_public_ip_on_launch = true

  tags = { Name = "public-az2" }
}

resource "aws_subnet" "private_az1" {
  vpc_id = aws_vpc.penxle.id

  cidr_block        = "10.0.200.0/22"
  availability_zone = "ap-northeast-2a"

  tags = { Name = "private-az1" }
}

resource "aws_subnet" "private_az2" {
  vpc_id = aws_vpc.penxle.id

  cidr_block        = "10.0.204.0/22"
  availability_zone = "ap-northeast-2b"

  tags = { Name = "private-az2" }
}

resource "aws_eip" "nat_private_az1" {
  tags = { Name = "nat-private-az1" }
}

resource "aws_eip" "nat_private_az2" {
  tags = { Name = "nat-private-az2" }
}

resource "aws_internet_gateway" "public" {
  vpc_id = aws_vpc.penxle.id

  tags = { Name = "public" }
}

resource "aws_nat_gateway" "private_az1" {
  allocation_id = aws_eip.nat_private_az1.id
  subnet_id     = aws_subnet.public_az1.id

  private_ip = cidrhost(aws_subnet.public_az1.cidr_block, -2)

  tags = { Name = "private-az1" }

  depends_on = [aws_internet_gateway.public]
}

resource "aws_nat_gateway" "private_az2" {
  allocation_id = aws_eip.nat_private_az2.id
  subnet_id     = aws_subnet.public_az2.id

  private_ip = cidrhost(aws_subnet.public_az2.cidr_block, -2)

  tags = { Name = "private-az2" }

  depends_on = [aws_internet_gateway.public]
}

resource "aws_default_route_table" "default" {
  default_route_table_id = aws_vpc.penxle.default_route_table_id

  tags = { Name = "default" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.penxle.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.public.id
  }

  tags = { Name = "public" }
}

resource "aws_route_table" "private_az1" {
  vpc_id = aws_vpc.penxle.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.private_az1.id
  }

  tags = { Name = "private-az1" }
}

resource "aws_route_table" "private_az2" {
  vpc_id = aws_vpc.penxle.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.private_az2.id
  }

  tags = { Name = "private-az2" }
}

resource "aws_route_table_association" "public_az1" {
  subnet_id      = aws_subnet.public_az1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_az2" {
  subnet_id      = aws_subnet.public_az2.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private_az1" {
  subnet_id      = aws_subnet.private_az1.id
  route_table_id = aws_route_table.private_az1.id
}

resource "aws_route_table_association" "private_az2" {
  subnet_id      = aws_subnet.private_az2.id
  route_table_id = aws_route_table.private_az2.id
}

resource "aws_default_security_group" "default" {
  vpc_id = aws_vpc.penxle.id

  ingress {
    protocol  = "all"
    from_port = 0
    to_port   = 0
    self      = true
  }

  egress {
    protocol    = "all"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "default" }
}

resource "aws_security_group" "public" {
  name        = "public"
  vpc_id      = aws_vpc.penxle.id
  description = "Open to the world"

  ingress {
    protocol    = "all"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    protocol    = "all"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "public" }
}
