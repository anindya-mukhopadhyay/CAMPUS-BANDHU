# CAMPUS-BANDHU Architecture

## High-Level System

1. `apps/web` (Next.js 15): user-facing Smart Campus OS, realtime dashboards, AI assistant panel.
2. `apps/api` (Express): domain APIs, Firebase-authenticated access, Firestore writes, socket emission, blockchain orchestration.
3. `services/ai` (FastAPI): semantic search, personalized recommendations, copilot orchestration.
4. `contracts` (Hardhat/Solidity): immutable achievement verification on Polygon.
5. Firebase: Auth, Firestore, Storage, FCM for identity and data backbone.

## Domain Modules

- Identity & Profiles
- Event Discovery & Registration
- Social Feed
- Marketplace
- Recruiter Opportunities
- AI Personalization
- Blockchain Achievements
- Realtime Engagement Channels

## Realtime Model

- Source of truth: Firestore
- Push UX: Socket.IO events from API mutation routes
- Frontend listeners: Firestore snapshots + socket pulses

## Security Model

- Firebase token verification middleware for protected APIs
- Helmet + CORS + rate limiting
- Principle of least privilege via collection-specific rules
- Smart contract ownership for mint authority

