resource "aws_ecs_cluster" "penxle" {
  name = "penxle"
}

resource "aws_ecs_service" "actions_runner" {
  cluster = aws_ecs_cluster.penxle.id
  name    = "actions-runner"

  desired_count   = 0
  launch_type     = "FARGATE"
  task_definition = aws_ecs_task_definition.actions_runner.arn

  network_configuration {
    assign_public_ip = true

    subnets = [
      aws_subnet.public_az1.id,
      aws_subnet.public_az2.id,
    ]

    security_groups = [
      aws_security_group.private.id,
    ]
  }

  lifecycle {
    ignore_changes = [
      desired_count,
    ]
  }
}

resource "aws_ecs_task_definition" "actions_runner" {
  family = "actions-runner"

  requires_compatibilities = ["FARGATE"]

  cpu    = "2048"
  memory = "4096"

  network_mode = "awsvpc"

  task_role_arn      = aws_iam_role.ecs_actions_runner.arn
  execution_role_arn = aws_iam_role.ecs_task_execution.arn

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "ARM64"
  }

  container_definitions = jsonencode([
    {
      name      = "actions-runner"
      image     = "721144421085.dkr.ecr.ap-northeast-2.amazonaws.com/actions-runner:latest"
      essential = true
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-create-group" : "true",
          "awslogs-group" : "/ecs/actions-runner",
          "awslogs-region" : "ap-northeast-2",
          "awslogs-stream-prefix" : "ecs"
        }
      },
    },
  ])
}
