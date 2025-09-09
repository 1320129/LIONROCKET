# AI Chat Service

## Setup

### Backend

cd backend
cp .env.example .env
npm i

# Optional: set ANTHROPIC_API_KEY in .env

npm run build
node dist/index.js

### Frontend

cd frontend
cp .env.example .env
npm i
npm run dev

Open http://localhost:5173

## Environment

- backend/.env
  - PORT=4000
  - JWT_SECRET=change-me
  - CORS_ORIGIN=http://localhost:5173
  - UPLOAD_DIR=uploads
  - ANTHROPIC_API_KEY=sk-ant-...
- frontend/.env
  - VITE_API_BASE=http://localhost:4000

## Features

- Auth: register/login/logout with JWT httpOnly cookie, protected routes
- Characters: 3 defaults + user-created with thumbnail upload (2MB, png/jpeg/webp)
- Chat: Claude proxy, 200-char input limit, messages persisted per character
- UI: responsive, dark mode toggle, timestamps, loading, retry with backoff
- Persistence: draft restore, last character, multi-tab sync

## Scripts

- backend: `npm run build` → `node dist/index.js`
- frontend: `npm run dev`

## Notes

- API key is server-side only (do not expose to frontend).
- To test quickly:
  - login → POST /chat with message ≤ 200 chars
  - list characters: GET /characters (auth required)
