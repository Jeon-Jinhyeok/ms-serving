# Minikube Without Pushing Images

You can run the cluster stack on minikube without pushing `ms-backend` or `api-gateway` images to Docker Hub.

On Windows PowerShell, prefer `infra/setup-local-minikube.ps1`. See `docs/minikube-powershell.md`.

## Start minikube

```bash
minikube start --cpus=6 --memory=12288 --driver=docker
```

Keep the tunnel running in a separate terminal:

```bash
minikube tunnel
```

## Install the cluster stack with local images

From the repository root:

```bash
cd infra
export FRONTEND_ORIGIN=http://localhost:3000
export USE_LOCAL_IMAGES=true
./setup.sh
```

When `USE_LOCAL_IMAGES=true`, `setup.sh`:

- builds `ko.local/ms-backend:local`
- builds `ko.local/ms-api-gateway:local`
- loads both images into minikube with `minikube image load`
- skips Docker Hub push
- configures Knative to skip digest resolution for local image registries

## Run the external frontend locally

After setup finishes, it prints a value like:

```text
NEXT_PUBLIC_API_URL=http://api.<EXTERNAL_IP>.sslip.io
```

Use that in `ms-frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://api.<EXTERNAL_IP>.sslip.io
NEXT_PUBLIC_GRAFANA_URL=http://grafana.<EXTERNAL_IP>.sslip.io
NEXT_PUBLIC_KIALI_URL=http://kiali.<EXTERNAL_IP>.sslip.io
```

Then run:

```bash
cd ../ms-frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Quick checks

```bash
kubectl get pods -A
kubectl get ksvc -A
kubectl get inferenceservice -A
curl http://api.<EXTERNAL_IP>.sslip.io/healthz
```

## Rebuilding after code changes

Run `setup.sh` again with `USE_LOCAL_IMAGES=true`, or rebuild and reload manually:

```bash
docker build -t ko.local/ms-backend:local ../ms-backend
docker build -t ko.local/ms-api-gateway:local ../api-gateway
minikube image load ko.local/ms-backend:local
minikube image load ko.local/ms-api-gateway:local
kubectl delete revision -n ms-backend --all
kubectl delete revision -n ms-gateway --all
```
