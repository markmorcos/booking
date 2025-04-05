# Deployment Guide for Fr. Youhanna Makin Application

This document outlines the deployment process for the Fr. Youhanna Makin appointment booking application, including setup instructions for both manual and automated deployments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Manual Deployment](#manual-deployment)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Kubernetes Configuration](#kubernetes-configuration)
6. [Monitoring and Logging](#monitoring-and-logging)
7. [Backup and Disaster Recovery](#backup-and-disaster-recovery)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

To deploy the application, you need:

- Docker and Docker Compose for local development
- kubectl for Kubernetes interaction
- doctl for DigitalOcean integration
- GitHub account with repository access
- DigitalOcean account with Kubernetes cluster

## Environment Variables

The application requires the following environment variables:

| Variable                 | Description                      | Example                                 |
| ------------------------ | -------------------------------- | --------------------------------------- |
| DATABASE_URL             | PostgreSQL connection string     | postgresql://user:pass@host:5432/dbname |
| RAILS_MASTER_KEY         | Rails master key for credentials | abcdef1234567890                        |
| ADMIN_EMAIL              | Default admin user email         | admin@fryouhannamakin.com               |
| ADMIN_PASSWORD           | Default admin user password      | secure-password                         |
| RAILS_ENV                | Rails environment                | production                              |
| RAILS_LOG_TO_STDOUT      | Output logs to stdout            | true                                    |
| RAILS_SERVE_STATIC_FILES | Serve static files               | true                                    |

## Manual Deployment

### Building the Docker Image

```bash
# Build the Docker image
docker build -t fr-youhanna-makin:latest .

# Run the container locally for testing
docker run -p 3000:3000 --env-file .env fr-youhanna-makin:latest

# Push to Docker Hub (if authorized)
docker tag fr-youhanna-makin:latest yourusername/fr-youhanna-makin:latest
docker push yourusername/fr-youhanna-makin:latest
```

### Deploying to Kubernetes

```bash
# Connect to the DigitalOcean Kubernetes cluster
doctl kubernetes cluster kubeconfig save your-cluster-name

# Create namespace
kubectl create namespace fr-youhanna-makin

# Apply Kubernetes manifests
kubectl apply -f k8s/configmap.yaml -n fr-youhanna-makin
kubectl apply -f k8s/secret.yaml -n fr-youhanna-makin
kubectl apply -f k8s/pvc.yaml -n fr-youhanna-makin
kubectl apply -f k8s/deployment.yaml -n fr-youhanna-makin
kubectl apply -f k8s/service.yaml -n fr-youhanna-makin
kubectl apply -f k8s/ingress.yaml -n fr-youhanna-makin

# Check deployment status
kubectl get all -n fr-youhanna-makin
```

## CI/CD Pipeline

Our GitHub Actions workflow automates the deployment process:

1. **Test**: Runs Rails and JavaScript tests
2. **Build and Push**: Builds the Docker image and pushes it to Docker Hub
3. **Deploy**: Deploys the application to DigitalOcean Kubernetes
4. **Documentation**: Generates and publishes API documentation

### GitHub Secrets Configuration

The following secrets need to be configured in the GitHub repository:

| Secret                    | Description                 |
| ------------------------- | --------------------------- |
| DOCKER_USERNAME           | Docker Hub username         |
| DOCKER_PASSWORD           | Docker Hub password         |
| DIGITALOCEAN_ACCESS_TOKEN | DigitalOcean API token      |
| DIGITALOCEAN_CLUSTER_NAME | Kubernetes cluster name     |
| DATABASE_URL              | Production database URL     |
| RAILS_MASTER_KEY          | Production Rails master key |
| ADMIN_PASSWORD            | Admin user password         |

## Kubernetes Configuration

Our Kubernetes setup includes:

- **Deployment**: Manages application pods with health checks and resource limits
- **Service**: Exposes the application within the cluster
- **Ingress**: Routes external traffic to the service
- **ConfigMap**: Stores non-sensitive configuration
- **Secret**: Stores sensitive information
- **PersistentVolumeClaim**: Allocates persistent storage

### SSL Configuration

The application uses Let's Encrypt for SSL certificates through cert-manager. The certificates are automatically renewed.

## Monitoring and Logging

- **Logs**: Application logs are sent to stdout and captured by Kubernetes
- **Metrics**: Kubernetes metrics are available through DigitalOcean dashboard
- **Alerts**: Configure alert policies in DigitalOcean

To view logs:

```bash
kubectl logs -f deployment/fr-youhanna-makin -n fr-youhanna-makin
```

## Backup and Disaster Recovery

### Database Backup

The database is backed up daily using DigitalOcean's managed database backup feature.

To manually backup the database:

```bash
pg_dump -U postgres -h <DB_HOST> -d fr_youhanna_makin > backup.sql
```

### Application Backup

Application code and configuration are stored in Git. Kubernetes configurations are in the `k8s/` directory.

## Troubleshooting

### Common Issues

1. **Pod startup failures**: Check logs with `kubectl logs`
2. **Database connection errors**: Verify DATABASE_URL and network connectivity
3. **SSL certificate issues**: Check cert-manager logs

### Rollback Procedure

To roll back to a previous version:

```bash
# Find previous deployment
kubectl rollout history deployment/fr-youhanna-makin -n fr-youhanna-makin

# Roll back to previous version
kubectl rollout undo deployment/fr-youhanna-makin -n fr-youhanna-makin

# Or roll back to a specific revision
kubectl rollout undo deployment/fr-youhanna-makin -n fr-youhanna-makin --to-revision=2
```
