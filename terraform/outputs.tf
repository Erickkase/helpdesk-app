output "alb_url" {
  description = "Application Load Balancer URL"
  value       = "http://${aws_lb.app_alb.dns_name}"
}
