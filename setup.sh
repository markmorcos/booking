#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up Kubernetes secrets for the booking application...${NC}\n"

# Get namespace
read -p "Enter the Kubernetes namespace (default: booking): " namespace
namespace=${namespace:-booking}

# Postgres secrets
echo -e "\n${GREEN}Setting up PostgreSQL secrets...${NC}"
read -p "Enter PostgreSQL host (default: localhost): " pghost
pghost=${pghost:-localhost}
read -p "Enter PostgreSQL user (default: postgres): " pguser
pguser=${pguser:-postgres}
read -s -p "Enter PostgreSQL password (default: postgres): " pgpassword
pgpassword=${pgpassword:-postgres}
read -p "Enter PostgreSQL database (default: booking_development): " pgdatabase
pgdatabase=${pgdatabase:-booking_development}
read -p "Enter PostgreSQL port (default: 5432): " pgport
pgport=${pgport:-5432}

# Create database-secret
kubectl -n "$namespace" create secret generic database-secret \
  --from-literal=DATABASE_URL="postgresql://$pguser:$pgpassword@$pghost:$pgport/$pgdatabase" \
  --dry-run=client -o yaml | kubectl apply -f -

# Create rails-secret
kubectl -n "$namespace" create secret generic rails-secret \
  --from-literal=SECRET_KEY_BASE=$(rails secret) \
  --dry-run=client -o yaml | kubectl apply -f -

# SMTP settings
echo -e "\n${GREEN}Setting up SMTP secrets...${NC}"
read -p "Enter SMTP address (default: smtp.gmail.com): " smtp_address
smtp_address=${smtp_address:-smtp.gmail.com}
read -p "Enter SMTP port (default: 587): " smtp_port
smtp_port=${smtp_port:-587}
read -p "Enter SMTP domain (default: gmail.com): " smtp_domain
smtp_domain=${smtp_domain:-gmail.com}
read -p "Enter SMTP username: " smtp_username
read -s -p "Enter SMTP password: " smtp_password

# Create smtp-secrets
kubectl -n "$namespace" create secret generic smtp-secrets \
  --from-literal=SMTP_ADDRESS="$smtp_address" \
  --from-literal=SMTP_PORT="$smtp_port" \
  --from-literal=SMTP_DOMAIN="$smtp_domain" \
  --from-literal=SMTP_USERNAME="$smtp_username" \
  --from-literal=SMTP_PASSWORD="$smtp_password" \
  --dry-run=client -o yaml | kubectl apply -f -

echo -e "\n${GREEN}Secrets have been created successfully in namespace: ${namespace}${NC}"
