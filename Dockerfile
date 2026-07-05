FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
COPY telegram-parser/package*.json ./telegram-parser/

# Install dependencies
RUN cd backend && npm install
RUN cd frontend && npm install
RUN cd telegram-parser && npm install

COPY . .

# Generate Prisma Client
RUN cd backend && npx prisma generate

# Build Frontend
RUN cd frontend && npm run build

# Build Backend
RUN cd backend && npm run build

# Build Parser (optional, we can just run ts-node)

EXPOSE 3000
EXPOSE 3001

# Start all three services
CMD ["sh", "-c", "cd backend && npm start & cd telegram-parser && npm start & cd frontend && npm start"]
