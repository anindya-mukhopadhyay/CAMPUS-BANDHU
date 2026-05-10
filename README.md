# CAMPUS-BANDHU

CAMPUS-BANDHU is a production-grade smart campus operating system that unifies events, verified student identity, social networking, AI recommendations, recruiter discovery, achievements on blockchain, and campus marketplace workflows.

## Monorepo Structure

- `apps/web`: Next.js 15 App Router frontend with 3D hero, realtime modules, AI assistant UI, and Firebase integration.
- `apps/api`: Express + TypeScript backend with modular APIs, Socket.IO, Firebase Admin auth, Firestore data access.
- `services/ai`: FastAPI service for semantic search, recommendation, and intelligence endpoints.
- `contracts`: Polygon-ready Solidity smart contracts for verified achievement NFTs.
- `infra/kubernetes`: K8s deployment manifests for web, api, and ai services.

## Core Features Implemented

- Firebase Authentication + verified token backend middleware
- Firestore-backed modules: events, profiles, posts, marketplace, recruiters, achievements
- Realtime experience: Firestore listeners + Socket.IO push channels
- AI service: embedding-based semantic retrieval + recommendation scoring API
- Blockchain layer: achievement minting and verification smart contract
- Deployment baseline: Dockerfiles, docker-compose, Kubernetes manifests, CI workflow

## Quick Start

1. Install dependencies:

```bash
pnpm install
```

2. Create `.env` from `.env.example` and set secrets.

3. Run all services in dev mode:

```bash
pnpm dev
```

- Web: `http://localhost:3000`
- API: `http://localhost:8080`
- AI: `http://localhost:8000`

## Service Commands

- `pnpm dev:web`
- `pnpm dev:api`
- `pnpm dev:ai`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`

## Production Notes

- Frontend deploy target: Vercel
- API/AI deploy targets: Railway/Render/Kubernetes
- Firebase Hosting config included for optional static/edge routing workflows
- Smart contract deployment scripts target Polygon mainnet/amoy via Hardhat

