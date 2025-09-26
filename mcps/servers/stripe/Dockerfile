FROM python:3.12-slim-trixie

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app
COPY . .

RUN uv sync

CMD ["uv", "run", "main.py"]
# docker build -t mantrakp04/mcps-stripe -f Dockerfile . && docker push mantrakp04/mcps-stripe
# docker run -p 8001:8001 mantrakp04/mcps-stripe