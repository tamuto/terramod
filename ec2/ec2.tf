resource "aws_instance" "ec2" {
    ami = var.ami
    instance_type = var.instance_type
    key_name = var.key_name
    subnet_id = data.aws_subnet.subnet.id
    private_ip = var.private_ip
    vpc_security_group_ids = [data.aws_security_group.default.id]

    root_block_device {
        volume_type = "gp2"
        volume_size = var.volume_size
    }
    ebs_block_device {
        device_name = "/dev/xvda"
        volume_size = 20
        volume_type = "gp2"
        delete_on_termination = true
    }

    credit_specification {
        cpu_credits = "standard"
    }

    iam_instance_profile = var.ec2_role

    tags = {
        Name = "${var.name}"
    }
}
