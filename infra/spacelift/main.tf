provider "spacelift" {}

data "spacelift_current_stack" "this" {}

resource "spacelift_stack" "penxle" {
  name     = "penxle"
  space_id = "root"
  labels = [
    "infracost",
    "terraform",
    "feature:add_plan_pr_comment",
    "managed-by:${data.spacelift_current_stack.this.id}"
  ]

  repository   = "penxle"
  branch       = "main"
  project_root = "infra/terraform"

  autodeploy            = true
  enable_local_preview  = true
  manage_state          = false
  protect_from_deletion = true

  terraform_smart_sanitization = true
  terraform_version            = ">= 1.5.0"
}

resource "spacelift_context" "penxle" {
  name     = "penxle"
  space_id = "root"
  labels   = ["managed-by:${data.spacelift_current_stack.this.id}"]
}

resource "spacelift_context_attachment" "penxle" {
  context_id = spacelift_context.penxle.id
  stack_id   = spacelift_stack.penxle.id
}
