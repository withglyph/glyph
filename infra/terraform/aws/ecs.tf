resource "aws_ecs_cluster" "penxle" {
  name = "penxle"
}

# resource "aws_ecs_service" "actions_runner" {
#   cluster = aws_ecs_cluster.penxle.id

#   name = "actions-runner"

#   task_definition = aws_ecs_task_definition.actions_runner.arn

#   launch_type   = "FARGATE"
#   desired_count = 2

#   enable_ecs_managed_tags = true

#   deployment_circuit_breaker {
#     enable   = true
#     rollback = true
#   }

#   network_configuration {
#     subnets = [
#       aws_subnet.private_az1.id,
#       aws_subnet.private_az2.id
#     ]

#     security_groups = [aws_security_group.private.id]
#   }
# }

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
      image     = "ghcr.io/penxle/actions-runner:latest"
      essential = true
      secrets = [
        {
          name      = "GH_APP_ID",
          valueFrom = "arn:aws:ssm:ap-northeast-2:${data.aws_caller_identity.current.account_id}:parameter/ecs/actions-runner/gh-app-id"
        },
        {
          name      = "GH_APP_PRIVATE_KEY",
          valueFrom = "arn:aws:ssm:ap-northeast-2:${data.aws_caller_identity.current.account_id}:parameter/ecs/actions-runner/gh-app-private-key"
        }
      ]
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
