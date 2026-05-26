# Mini HelpDesk App - Exam Practice

Project for practicing Git branches, Docker, Docker Hub, Terraform, Load Balancer and Auto Scaling Group.

## Branch flow

feature/helpdesk -> dev -> qa -> main

## Local run

```bash
docker compose up --build
```

Frontend: http://localhost:3000
Backend health: http://localhost:4000/health

## Docker Hub tags

Backend:
- erickkase/helpdesk-backend:dev
- erickkase/helpdesk-backend:qa
- erickkase/helpdesk-backend:prod

Frontend:
- erickkase/helpdesk-frontend:dev
- erickkase/helpdesk-frontend:qa
- erickkase/helpdesk-frontend:prod

## AWS deployment

Terraform creates:
- Security Group
- Application Load Balancer
- Target Group
- Launch Template
- Auto Scaling Group

```bash
cd terraform
terraform init
terraform validate
terraform apply
```

Then open the output `alb_url`.
