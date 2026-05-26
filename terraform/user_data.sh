#!/bin/bash
set -e
apt-get update -y
apt-get install -y docker.io docker-compose-plugin curl
systemctl enable docker
systemctl start docker
mkdir -p /opt/helpdesk-app
cd /opt/helpdesk-app
curl -L "${docker_compose_url}" -o docker-compose.aws.yml
docker compose -f docker-compose.aws.yml pull
docker compose -f docker-compose.aws.yml up -d
