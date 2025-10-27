resource "aws_service_discovery_http_namespace" "ns" {
  name = var.name
}

resource "aws_service_discovery_service" "ns" {
  name = "${var.name}-srvc"
  namespace_id = aws_service_discovery_http_namespace.ns.id
}

resource "aws_service_discovery_instance" "ns" {
  instance_id = "${var.name}-inst"
  service_id  = aws_service_discovery_service.ns.id

  attributes = {
    AWS_INSTANCE_IPV4 = var.instance_ip
    AWS_INSTANCE_PORT  = var.instance_port
  }
}