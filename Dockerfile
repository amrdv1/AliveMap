FROM node:18-alpine

WORKDIR /app

# Copy root package.json if exists, and both workspaces
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies (npm install will install for both if using workspaces, otherwise just backend/frontend)
RUN cd backend && npm install
RUN cd frontend && npm install

COPY . .

# Generate Prisma Client
RUN cd backend && npx prisma generate

# Build Frontend
RUN cd frontend && npm run build

# Build Backend
RUN cd backend && npm run build

EXPOSE 3000
EXPOSE 3001

# Start script can be modified for Railway
CMD ["sh", "-c", "cd backend && npm start & cd frontend && npm start"]
