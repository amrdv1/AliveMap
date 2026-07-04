# AirMap

Realtime interactive live map of Ukraine displaying publicly reported aerial threats based on open-source information.

## Tech Stack
- **Frontend**: Next.js 15, React 19, TailwindCSS, Leaflet, Zustand, Socket.IO Client.
- **Backend**: Node.js, Express, Socket.IO, Prisma, PostgreSQL, Redis.

## Getting Started

1. Clone repository
2. Start Databases:
   ```bash
   docker-compose up -d
   ```
3. Setup Backend:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npx prisma migrate dev
   npm run dev
   ```
4. Setup Frontend:
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```

## Disclaimer
Uses only publicly available data. Does not fabricate exact military locations or trajectories.
