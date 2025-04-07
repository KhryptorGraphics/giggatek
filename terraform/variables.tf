# GigGatek Terraform Variables

variable "aws_region" {
  description = "AWS region to deploy to"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Deployment environment (e.g., dev, staging, production)"
  type        = string
  default     = "staging"
  
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be one of: dev, staging, production."
  }
}

variable "availability_zones" {
  description = "List of availability zones to use for resources"
  type        = list(string)
  default     = ["us-west-2a", "us-west-2b", "us-west-2c"]
}

variable "ssh_allowed_cidrs" {
  description = "List of CIDRs allowed to SSH into instances"
  type        = list(string)
  default     = ["0.0.0.0/0"]  # WARNING: Should be restricted in production
  
  validation {
    condition     = length(var.ssh_allowed_cidrs) > 0
    error_message = "At least one CIDR must be specified for SSH access."
  }
}

variable "db_allocated_storage" {
  description = "Allocated storage for the database (in GB)"
  type        = number
  default     = 20
  
  validation {
    condition     = var.db_allocated_storage >= 20
    error_message = "Allocated storage must be at least 20 GB."
  }
}

variable "db_instance_class" {
  description = "Instance class for the database"
  type        = string
  default     = "db.t3.small"
}

variable "db_name" {
  description = "Name of the database"
  type        = string
  default     = "giggatek"
}

variable "db_username" {
  description = "Username for the database"
  type        = string
  default     = "giggatek_user"
  sensitive   = true
}

variable "db_password" {
  description = "Password for the database"
  type        = string
  sensitive   = true
}

variable "app_instance_type" {
  description = "Instance type for application servers"
  type        = string
  default     = "t3.small"
}

variable "app_instance_count" {
  description = "Number of application server instances"
  type        = number
  default     = 2
  
  validation {
    condition     = var.app_instance_count > 0
    error_message = "At least one application server instance is required."
  }
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "giggatek.com"
}

variable "certificate_arn" {
  description = "ARN of the SSL certificate to use for HTTPS"
  type        = string
  default     = ""
}

variable "enable_bastion" {
  description = "Whether to enable a bastion host for SSH access"
  type        = bool
  default     = true
}

variable "bastion_instance_type" {
  description = "Instance type for the bastion host"
  type        = string
  default     = "t3.micro"
}
