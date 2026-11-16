FROM node:26-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY prisma.config.ts ./
COPY prisma/ ./prisma/
RUN npx prisma generate

COPY src/ ./src/
COPY docs/ ./docs/

EXPOSE 3000

# migrations idempotentes no boot: o compose sobe do zero absoluto com 1 comando
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
