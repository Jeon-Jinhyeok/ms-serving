# API Gateway

Lightweight BFF/proxy for the frontend. It keeps `ms-frontend` coupled to one API base URL while backend services are split behind it.

## Routes

| Prefix | Current target |
| --- | --- |
| `/api/auth` | `ms-backend` |
| `/api/user` | `ms-backend` |
| `/dashboard` | `ms-backend` |
| `/user` | Compatibility rewrite to `/api/user` |

## Environment

| Name | Default |
| --- | --- |
| `PORT` | `8088` |
| `BACKEND_URL` | `http://localhost:8080` |
| `ALLOWED_ORIGINS` | `http://localhost:3000` |
