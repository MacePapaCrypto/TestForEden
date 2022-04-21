variable "region" {
  default     = "us-east-2"
  type        = string
  description = "AWS REGION NAME"
}
variable "name" {
  default     = "moon-social-cluster"
  type        = string
  description = "EKS Cluster Name"
}
variable "cluster_instance_types" {
  type        = list(string)
  description = "Cluster Instance type"
  default     = ["t2.micro"]
}

variable "access_key" {
  default = "XX"
}

variable "secret_key" {
  default = "XX"
}
