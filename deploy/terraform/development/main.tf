provider "aws" {
  region = var.region
}

module "eks" {
  source                 = "../modules/eks"
  name                   = var.name
  region                 = "us-central1"
  cluster_instance_types = var.cluster_instance_types
  access_key             = var.access_key
  secret_key             = var.secret_key

}
