variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "helpdesk-app"
}

variable "docker_compose_url" {
  description = "Raw URL of docker-compose.aws.yml in GitHub. Replace this after pushing the repo."
  type        = string
  default     = "https://raw.githubusercontent.com/CHANGE-USER/CHANGE-REPO/main/docker-compose.aws.yml"
}
