resource "vercel_project" "penxle" {
  name = "penxle"

  framework      = "sveltekit-1"
  ignore_command = "../../scripts/vercel-ignore.sh"

  root_directory = "sites/penxle.com"
  git_repository = {
    type = "github"
    repo = "penxle/penxle"
  }

  vercel_authentication = {}
}

resource "vercel_project" "company" {
  name = "company"

  framework      = "sveltekit-1"
  ignore_command = "../../scripts/vercel-ignore.sh"

  root_directory = "sites/penxle.io"
  git_repository = {
    type = "github"
    repo = "penxle/penxle"
  }

  vercel_authentication = {}
}

resource "vercel_project" "help" {
  name = "help"

  framework      = "sveltekit-1"
  ignore_command = "../../scripts/vercel-ignore.sh"

  root_directory = "sites/help.penxle.com"
  git_repository = {
    type = "github"
    repo = "penxle/penxle"
  }

  vercel_authentication = {}
}

resource "vercel_project" "landing" {
  name = "landing"

  framework      = "sveltekit-1"
  ignore_command = "../../scripts/vercel-ignore.sh"

  root_directory = "sites/landing.penxle.com"
  git_repository = {
    type = "github"
    repo = "penxle/penxle"
  }

  vercel_authentication = {}
}
