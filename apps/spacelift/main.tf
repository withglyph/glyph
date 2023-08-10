provider "spacelift" {}

resource "spacelift_stack" "penxle" {
  name     = "penxle"
  space_id = "root"
  labels   = ["managed", "depends-on:${data.spacelift_current_stack.this.id}"]

  repository   = "penxle"
  branch       = "spacelift"
  project_root = "apps/terraform"

  autodeploy            = true
  enable_local_preview  = true
  protect_from_deletion = true

  terraform_smart_sanitization = true
  terraform_version            = ">= 1.5.0"
}
