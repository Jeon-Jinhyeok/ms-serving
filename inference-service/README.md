# Inference Service

Internal model orchestration service for MS-Serving.

It receives normalized JSON requests from `ms-backend`, calls the configured model servers, and returns model responses without owning users, auth, files, or usage history.

## Endpoints

- `GET /healthz`
- `POST /image-class`
- `POST /text-summary`

## Environment

| Variable | Default |
| --- | --- |
| `PORT` | `8081` |
| `IMAGE_MODEL_URL` | `http://localhost:9001/v1/models/mobilenet:predict` |
| `IMAGE_MODEL_HOST` | empty |
| `TEXT_MODEL_URL` | `http://localhost:9002/v1/models/kobart-summary:predict` |
| `TEXT_MODEL_HOST` | empty |
| `MODEL_TIMEOUT_MS` | `30000` |
