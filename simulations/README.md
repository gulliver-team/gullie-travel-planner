HTMX + FastAPI + Postgres (Docker Compose)

Minimal boilerplate: Nginx serves a static HTMX frontend, which proxies `/api/*` to a FastAPI backend. The backend connects to a Postgres database. All services run via Docker Compose.

Services
- frontend: Nginx serving static files with proxy to `api`
- api: FastAPI app on Uvicorn
- db: Postgres 16

Quick start
1) Ensure Docker is running.
2) Optionally edit `.env` for database credentials.
3) Build and start containers:
   docker compose up --build
4) Open the app:
   http://localhost:8080

Development (live reload)
- Use the dev override to mount source and enable Uvicorn reload:
  docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
- Changes in `frontend/static/` are served immediately by Nginx (no rebuild).
- Backend auto-reloads on changes in `backend/app/`.

Project layout
- docker-compose.yml
- .env
- backend/
  - Dockerfile
  - requirements.txt
  - app/main.py
- frontend/
  - Dockerfile
  - nginx.conf
  - static/index.html

API endpoints
- GET /health → simple health check
- GET /api/hello → returns greeting (text)
- GET /api/db-ping → connects to Postgres and returns `{"ok": true, "result": 1}` on success
- POST /api/stream → streams text from OpenAI (chunked plain text)

Notes
- Frontend proxies `/api/*` to `api:8000` inside the compose network, avoiding CORS issues.
- Postgres data persists in the `db_data` volume.
 - For production-style images, run without the dev override.
 - For streaming, set `OPENAI_API_KEY` in `.env`. You may also set `OPENAI_MODEL` (default `gpt-4o-mini`). Nginx proxy buffering is disabled for `/api/*` to enable live streaming.

Streaming example (Python)
```python
from openai import OpenAI
client = OpenAI()

with client.responses.stream(
    model="gpt-4o-mini",
    input=[{"role": "user", "content": "Say 'double bubble bath' ten times fast."}],
) as stream:
    for event in stream:
        if event.type == "response.output_text.delta":
            print(event.delta, end="")
    # Optionally access final response
    final = stream.get_final_response()
```
