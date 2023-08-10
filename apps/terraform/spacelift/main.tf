resource "spacelift_stack" "managed-stack" {
  name = "Stack managed by Spacelift"

  # Source code.
  repository = "testing-spacelift"
  branch     = "master"
}
