# Minikube Setup From PowerShell

Use this flow on Windows PowerShell. It avoids `bash`, so it uses the same `kubectl` context that already works in PowerShell.

## Start minikube

```powershell
minikube start --cpus=6 --memory=12288 --driver=docker
```

You do not need `minikube tunnel` for this script. It starts a background `kubectl port-forward` from `localhost:8080` to the Istio ingressgateway Service.

## Run setup without Docker Hub push

From the repo:

```powershell
cd C:\ms-serving\infra
.\setup-local-minikube.ps1
```

The default behavior is equivalent to:

```powershell
.\setup-local-minikube.ps1 `
  -FrontendOrigin "http://localhost:3000" `
  -UseLocalImages
```

It builds and loads these local images into minikube:

- `ko.local/ms-backend:local`
- `ko.local/ms-api-gateway:local`

## Run the frontend outside the cluster

After setup finishes, copy the printed `NEXT_PUBLIC_API_URL` value into:

```text
C:\ms-serving\ms-frontend\.env.local
```

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GRAFANA_URL=http://localhost:8080
NEXT_PUBLIC_KIALI_URL=http://localhost:8080
```

Then:

```powershell
cd C:\ms-serving\ms-frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Quick checks

```powershell
kubectl get pods -A
kubectl get ksvc -A
kubectl get gateway,virtualservice -A
curl http://localhost:8080/healthz
```

## Faster iteration

If you only want to verify Istio/Knative/backend/gateway first, skip KServe:

```powershell
.\setup-local-minikube.ps1 -SkipKServe
```

If your laptop is struggling, also skip monitoring:

```powershell
.\setup-local-minikube.ps1 -SkipKServe -SkipMonitoring
```
