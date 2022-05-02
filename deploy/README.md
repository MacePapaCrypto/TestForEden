# Deployment

## Github Actions

## Terraform
Spawns up a t2.micro EKS cluster
Applies following helm charts
* nginx ingress
* cert-manager
* prometheus
* grafana
* keel 

### Development
```
cd terraform/production
terraform init
terraform plan
terraform apply
```
### Production
```
cd terraform/production
terraform init
terraform plan
terraform apply
```

## Docker
### Frontend
`docker build . -t frontend-app -f frontend/Dockerfile`
### Backend
`docker build . -t backend-app -f frontend/Dockerfile`
## Docker Compose
`docker-compose up -d` 