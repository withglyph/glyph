resource "spacelift_stack" "penxle" {
  name       = "penxle"
  repository = "penxle"
  branch     = "main"


  project_root = "apps/terraform"

  space_id = "root"

  autodeploy            = true
  enable_local_preview  = true
  protect_from_deletion = true

  terraform_smart_sanitization = true
  terraform_version            = ">= 1.5.0"
}
