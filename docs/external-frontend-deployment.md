# External Frontend Deployment

The frontend is intentionally kept outside the Kubernetes cluster. Kubernetes and Istio own the API, service-to-service traffic, model serving, and traffic policies. The frontend can be deployed to Vercel, Netlify, S3 + CloudFront, or a separate Nginx host.

## Runtime Shape

```text
browser -> external frontend -> Istio Ingress Gateway -> api-gateway -> backend services -> KServe models
```

Only the API domain should point to the cluster.

## Frontend Environment

Set the frontend API base URL to the public Istio Ingress Gateway host:

```env
NEXT_PUBLIC_API_URL=https://api.example.com
```

For the default `setup.sh` magic domain flow, the script prints:

```text
NEXT_PUBLIC_API_URL=http://api.<EXTERNAL_IP>.sslip.io
```

Use that value when building or deploying `ms-frontend`.

## Cluster Setup

Before running `infra/setup.sh`, set the frontend origin that should be allowed by the API Gateway CORS layer:

```bash
export FRONTEND_ORIGIN=https://frontend.example.com
cd infra
./setup.sh
```

For local frontend development against the cluster:

```bash
export FRONTEND_ORIGIN=http://localhost:3000
```

For minikube without Docker Hub push:

```bash
export FRONTEND_ORIGIN=http://localhost:3000
export USE_LOCAL_IMAGES=true
cd infra
./setup.sh
```

See `docs/minikube-without-push.md` for the full flow.

## Important Rules

- Do not expose `ms-backend` directly to the public internet.
- Do not expose KServe model URLs directly to the browser.
- Browser traffic should call only `NEXT_PUBLIC_API_URL`.
- Istio `Gateway`, `VirtualService`, `RequestAuthentication`, `AuthorizationPolicy`, rate limit, timeout, retry, and circuit breaker policies should be applied at or behind the API domain.
