
provider "kubernetes" {
  host                   = data.aws_eks_cluster.cluster.endpoint
  token                  = data.aws_eks_cluster_auth.cluster.token
  cluster_ca_certificate = base64encode(data.aws_eks_cluster.cluster.certificate_authority.0.data)
}

provider "helm" {
  kubernetes {
    host                   = data.aws_eks_cluster.cluster.endpoint
    token                  = data.aws_eks_cluster_auth.cluster.token
    cluster_ca_certificate = base64encode(data.aws_eks_cluster.cluster.certificate_authority.0.data)
  }

}
resource "helm_release" "ingress_nginx" {
  name       = "ingress-nginx"
  repository = "https://charts.bitnami.com/bitnami"
  version    = "9.1.21"
  chart      = "nginx-ingress-controller"

  namespace        = "nginx"
  create_namespace = true

  values = [file("${path.module}/yaml_files/nginx_ingress_values.yaml")]

  depends_on = [
    module.eks
  ]
}

resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"
  }
}

resource "kubernetes_config_map" "prometheus_config" {
  metadata {
    name      = "prometheus-config"
    namespace = "monitoring"
  }

  data = {
    "prometheus.yml" = file("${path.module}/yaml_files/prometheus_config_map.yaml")
  }
  depends_on = [
    kubernetes_namespace.monitoring
  ]
}

# Values documentation: https://github.com/bitnami/charts/blob/master/bitnami/kube-prometheus/values.yaml
resource "helm_release" "prometheus" {
  name        = "prometheus"
  repository  = "https://charts.bitnami.com/bitnami"
  chart       = "kube-prometheus"
  version     = "6.9.2"
  namespace   = "monitoring"
  atomic      = true
  max_history = 5

  values = [
    file("${path.module}/yaml_files/prometheus.yaml")
  ]

  depends_on = [
    kubernetes_config_map.prometheus_config,
  ]
}
resource "helm_release" "grafana" {
  name        = "grafana"
  repository  = "https://charts.bitnami.com/bitnami"
  chart       = "grafana"
  version     = "7.6.27"
  namespace   = "monitoring"
  atomic      = true
  max_history = 5

  values = [
    file("${path.module}/yaml_files/grafana_values.yaml")
  ]

  depends_on = [
    module.eks
  ]
}

resource "kubernetes_namespace" "cert_manager" {
  metadata {
    name = "cert-manager"
  }
}

resource "helm_release" "cert_manager" {
  name        = "cert-manager"
  repository  = "https://charts.bitnami.com/bitnami"
  chart       = "cert-manager"
  version     = "0.4.13"
  namespace   = "cert-manager"
  atomic      = true
  max_history = 5

  values = [
    file("${path.module}/yaml_files/cert_manager_values.yaml")
  ]

  depends_on = [
    kubernetes_namespace.cert_manager,
    module.eks
  ]

}
