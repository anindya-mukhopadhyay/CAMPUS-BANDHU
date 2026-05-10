# Deployment Runbook

## Local

1. `pnpm install`
2. Copy `.env.example` to `.env` and fill secrets.
3. `pnpm dev`

## Docker

- `docker compose up --build`

## Kubernetes

1. Build/push images:
   - `campus-bandhu-web`
   - `campus-bandhu-api`
   - `campus-bandhu-ai`
2. `kubectl apply -f infra/kubernetes/namespace.yaml`
3. `kubectl apply -f infra/kubernetes/web.yaml`
4. `kubectl apply -f infra/kubernetes/api.yaml`
5. `kubectl apply -f infra/kubernetes/ai.yaml`
6. `kubectl apply -f infra/kubernetes/ingress.yaml`

## Smart Contract

1. Configure `PRIVATE_KEY` and `POLYGON_RPC_URL`.
2. `pnpm --filter @campus-bandhu/contracts build`
3. `pnpm --filter @campus-bandhu/contracts deploy:amoy`
4. Save deployed address to `ACHIEVEMENT_CONTRACT_ADDRESS`.

