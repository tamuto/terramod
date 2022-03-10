resource "aws_service_discovery_http_namespace" "example" {
  name = var.name
}

resource "aws_service_discovery_service" "example" {
  name = "${var.name}-srvc"
  namespace_id = aws_service_discovery_http_namespace.example.id
}

resource "aws_service_discovery_instance" "example" {
  instance_id = "${var.name}-inst"
  service_id  = aws_service_discovery_service.example.id

  attributes = {
    AWS_INSTANCE_IPV4 = var.instance_ip
    AWS_INSTANCE_PORT  = var.instance_port
  }
}