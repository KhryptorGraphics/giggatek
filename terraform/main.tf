# GigGatek Infrastructure as Code - Terraform Configuration

# Configure the cloud provider (AWS example)
provider "aws" {
  region = var.aws_region
}

# Create a VPC for isolation
resource "aws_vpc" "giggatek_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  
  tags = {
    Name        = "${var.environment}-giggatek-vpc"
    Environment = var.environment
    Project     = "GigGatek"
  }
}

# Create public subnets for load balancers
resource "aws_subnet" "public_subnet" {
  count                   = length(var.availability_zones)
  vpc_id                  = aws_vpc.giggatek_vpc.id
  cidr_block              = "10.0.${count.index}.0/24"
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true
  
  tags = {
    Name        = "${var.environment}-giggatek-public-subnet-${count.index + 1}"
    Environment = var.environment
    Project     = "GigGatek"
  }
}

# Create private subnets for application servers
resource "aws_subnet" "private_subnet" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.giggatek_vpc.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = var.availability_zones[count.index]
  
  tags = {
    Name        = "${var.environment}-giggatek-private-subnet-${count.index + 1}"
    Environment = var.environment
    Project     = "GigGatek"
  }
}

# Create an internet gateway
resource "aws_internet_gateway" "giggatek_igw" {
  vpc_id = aws_vpc.giggatek_vpc.id
  
  tags = {
    Name        = "${var.environment}-giggatek-igw"
    Environment = var.environment
    Project     = "GigGatek"
  }
}

# Create a route table for public subnets
resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.giggatek_vpc.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.giggatek_igw.id
  }
  
  tags = {
    Name        = "${var.environment}-giggatek-public-route-table"
    Environment = var.environment
    Project     = "GigGatek"
  }
}

# Associate public subnets with the public route table
resource "aws_route_table_association" "public_subnet_association" {
  count          = length(var.availability_zones)
  subnet_id      = aws_subnet.public_subnet[count.index].id
  route_table_id = aws_route_table.public_route_table.id
}

# Create a security group for the load balancer
resource "aws_security_group" "lb_sg" {
  name        = "${var.environment}-giggatek-lb-sg"
  description = "Security group for the load balancer"
  vpc_id      = aws_vpc.giggatek_vpc.id
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name        = "${var.environment}-giggatek-lb-sg"
    Environment = var.environment
    Project     = "GigGatek"
  }
}

# Create a security group for the application servers
resource "aws_security_group" "app_sg" {
  name        = "${var.environment}-giggatek-app-sg"
  description = "Security group for the application servers"
  vpc_id      = aws_vpc.giggatek_vpc.id
  
  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.lb_sg.id]
  }
  
  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    cidr_blocks     = var.ssh_allowed_cidrs
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name        = "${var.environment}-giggatek-app-sg"
    Environment = var.environment
    Project     = "GigGatek"
  }
}

# Create a security group for the database
resource "aws_security_group" "db_sg" {
  name        = "${var.environment}-giggatek-db-sg"
  description = "Security group for the database"
  vpc_id      = aws_vpc.giggatek_vpc.id
  
  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.app_sg.id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name        = "${var.environment}-giggatek-db-sg"
    Environment = var.environment
    Project     = "GigGatek"
  }
}

# Create a DB subnet group
resource "aws_db_subnet_group" "giggatek_db_subnet_group" {
  name       = "${var.environment}-giggatek-db-subnet-group"
  subnet_ids = aws_subnet.private_subnet[*].id
  
  tags = {
    Name        = "${var.environment}-giggatek-db-subnet-group"
    Environment = var.environment
    Project     = "GigGatek"
  }
}

# Create an RDS instance for MySQL
resource "aws_db_instance" "giggatek_db" {
  identifier              = "${var.environment}-giggatek-db"
  allocated_storage       = var.db_allocated_storage
  storage_type            = "gp2"
  engine                  = "mysql"
  engine_version          = "8.0"
  instance_class          = var.db_instance_class
  db_name                 = var.db_name
  username                = var.db_username
  password                = var.db_password
  parameter_group_name    = "default.mysql8.0"
  db_subnet_group_name    = aws_db_subnet_group.giggatek_db_subnet_group.name
  vpc_security_group_ids  = [aws_security_group.db_sg.id]
  skip_final_snapshot     = true
  backup_retention_period = 7
  
  tags = {
    Name        = "${var.environment}-giggatek-db"
    Environment = var.environment
    Project     = "GigGatek"
  }
}

# Create an Application Load Balancer
resource "aws_lb" "giggatek_lb" {
  name               = "${var.environment}-giggatek-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.lb_sg.id]
  subnets            = aws_subnet.public_subnet[*].id
  
  enable_deletion_protection = var.environment == "production" ? true : false
  
  tags = {
    Name        = "${var.environment}-giggatek-lb"
    Environment = var.environment
    Project     = "GigGatek"
  }
}

# Create a target group for the frontend service
resource "aws_lb_target_group" "frontend_tg" {
  name     = "${var.environment}-giggatek-frontend-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.giggatek_vpc.id
  
  health_check {
    path                = "/"
    port                = "traffic-port"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
  }
  
  tags = {
    Name        = "${var.environment}-giggatek-frontend-tg"
    Environment = var.environment
    Project     = "GigGatek"
  }
}

# Create a target group for the backend service
resource "aws_lb_target_group" "backend_tg" {
  name     = "${var.environment}-giggatek-backend-tg"
  port     = 5000
  protocol = "HTTP"
  vpc_id   = aws_vpc.giggatek_vpc.id
  
  health_check {
    path                = "/api/health"
    port                = "traffic-port"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
  }
  
  tags = {
    Name        = "${var.environment}-giggatek-backend-tg"
    Environment = var.environment
    Project     = "GigGatek"
  }
}

# Create an HTTP listener for the load balancer (with redirect to HTTPS)
resource "aws_lb_listener" "http_listener" {
  load_balancer_arn = aws_lb.giggatek_lb.arn
  port              = 80
  protocol          = "HTTP"
  
  default_action {
    type = "redirect"
    
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# Create a Redis cluster for caching
resource "aws_elasticache_subnet_group" "redis_subnet_group" {
  name       = "${var.environment}-giggatek-redis-subnet-group"
  subnet_ids = aws_subnet.private_subnet[*].id
  
  tags = {
    Name        = "${var.environment}-giggatek-redis-subnet-group"
    Environment = var.environment
    Project     = "GigGatek"
  }
}

resource "aws_security_group" "redis_sg" {
  name        = "${var.environment}-giggatek-redis-sg"
  description = "Security group for Redis"
  vpc_id      = aws_vpc.giggatek_vpc.id
  
  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.app_sg.id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name        = "${var.environment}-giggatek-redis-sg"
    Environment = var.environment
    Project     = "GigGatek"
  }
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "${var.environment}-giggatek-redis"
  engine               = "redis"
  node_type            = "cache.t3.small"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis6.x"
  engine_version       = "6.x"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.redis_subnet_group.name
  security_group_ids   = [aws_security_group.redis_sg.id]
  
  tags = {
    Name        = "${var.environment}-giggatek-redis"
    Environment = var.environment
    Project     = "GigGatek"
  }
}

# Define outputs
output "vpc_id" {
  value = aws_vpc.giggatek_vpc.id
}

output "db_endpoint" {
  value = aws_db_instance.giggatek_db.endpoint
}

output "redis_endpoint" {
  value = aws_elasticache_cluster.redis.cache_nodes.0.address
}

output "load_balancer_dns" {
  value = aws_lb.giggatek_lb.dns_name
}
