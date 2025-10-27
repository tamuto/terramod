
data "aws_ssm_parameter" "ami" {
    name = var.ami
}

resource "aws_instance" "ec2" {
    ami = data.aws_ssm_parameter.ami.value
    instance_type = var.instance_type
    key_name = var.key_name
    subnet_id = data.aws_subnet.subnet.id
    private_ip = var.private_ip
    vpc_security_group_ids = var.security_group_ids

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
