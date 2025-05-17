kubectl delete -f backend/k8s/00-prepare-database.yaml || true
kubectl apply -f backend/k8s/00-prepare-database.yaml