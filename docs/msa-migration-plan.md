# MSA Migration Plan

## Target Direction

The first migration step is to keep `ms-frontend` outside the Kubernetes cluster and place an API Gateway/BFF behind the Istio Ingress Gateway. The frontend should only know the public API URL. Backend services can then be split behind the gateway without changing frontend routing.

## Current Step Implemented

- Added `api-gateway`, a lightweight Node.js BFF/proxy.
- Added `inference-service`, an internal model orchestration service.
- Added local Docker Compose environment under `infra/local`.
- Added mock image/text model servers so local development does not require KServe.
- Updated frontend API calls to use `src/lib/api.ts`.
- Added Istio manifests for Gateway routing, JWT verification template, authorization policy, local rate limit, and circuit breaker settings.
- Removed frontend from the Kubernetes deployment path. Deploy `ms-frontend` externally and set `NEXT_PUBLIC_API_URL` to the public Istio API host.

## Local Development

Run the local stack from the repository root:

```bash
docker compose -f infra/local/docker-compose.yml up --build
```

Local endpoints:

- Frontend: `http://localhost:3000`
- API Gateway: `http://localhost:8088`
- Backend: `http://localhost:8080`
- Inference service: `http://localhost:8081`
- Image mock model: `http://localhost:9001`
- Text mock model: `http://localhost:9002`
- PostgreSQL: `localhost:5432`

The local call path is:

```text
browser -> external ms-frontend -> Istio Ingress Gateway -> api-gateway -> ms-backend -> inference-service -> model servers
```

## Kubernetes Application Layer

Apply the gateway before routing traffic through Istio. The frontend is not deployed to Kubernetes:

```bash
kubectl apply -f infra/apps/api-gateway.yaml
```

For a Knative-based gateway instead:

```bash
kubectl apply -f infra/apps/api-gateway-knative.yaml
```

## Istio Policy Application Order

After Istio and namespaces are ready:

```bash
kubectl apply -f infra/istio/gateway/api-gateway.yaml
kubectl apply -f infra/istio/security/peer-authentication.yaml
kubectl apply -f infra/istio/security/jwt-request-authentication.yaml
kubectl apply -f infra/istio/security/authorization-policy.yaml
kubectl apply -f infra/istio/traffic/circuit-breakers.yaml
kubectl apply -f infra/istio/traffic/virtual-services.yaml
kubectl apply -f infra/istio/rate-limit/local-rate-limit-api-gateway.yaml
```

## External Frontend

Build and deploy `ms-frontend` outside Kubernetes. Its public environment must point at the Istio API domain:

```env
NEXT_PUBLIC_API_URL=https://api.example.com
```

When running `infra/setup.sh`, set the allowed browser origin for CORS:

```bash
export FRONTEND_ORIGIN=https://frontend.example.com
```

For local minikube development without pushing images:

```bash
export FRONTEND_ORIGIN=http://localhost:3000
export USE_LOCAL_IMAGES=true
```

See `docs/external-frontend-deployment.md` for details.

## JWT Note

Istio `RequestAuthentication` expects JWT validation through an issuer and JWKS endpoint. The current backend issues an application-local JWT with a shared secret. For production MSA, use one of these approaches:

- Introduce Keycloak or another OIDC provider.
- Split `auth-service` and expose `/.well-known/jwks.json`.
- Keep Spring Security validation only until JWKS-based verification is available.

## Next Service Split

Recommended split order:

1. Move model invocation from `ms-backend` into `inference-service`.
2. Move usage history and stats into `history-service`.
3. Move file storage into `file-service` and store objects in S3/GCS/MinIO.
4. Split auth/user only after JWT issuer strategy is decided.

## Transitional Routing Contract

The API Gateway can now route each bounded context independently while still defaulting to the current monolithic backend:

| Route family | Gateway env | Future service |
| --- | --- | --- |
| `/api/auth/*` | `AUTH_SERVICE_URL` | `auth-service` |
| `/api/user/*`, `/user/*`, `/dashboard/usage-stats` | `USER_SERVICE_URL` | `user-service` or `history-service` |
| `/dashboard/image-class`, `/dashboard/text-summary` | `INFERENCE_SERVICE_URL` | `inference-service` |

This lets the team deploy one extracted service at a time without changing the frontend API base URL.

Before applying the Kubernetes backend manifests, create `ms-backend-secrets` from `infra/secrets.example.yaml` and replace the example values.

## Current MSA Boundary

`inference-service` now owns model request normalization, model server timeouts, and model error translation. `ms-backend` still owns authentication, uploaded file persistence, and usage history, then delegates model execution to `inference-service` through `INTERNAL_INFERENCE_URL`.

This keeps user-facing behavior stable while removing model-serving concerns from the monolithic backend.
