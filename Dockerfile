# Stage 1: Base
FROM node:20-alpine AS base
RUN npm install -g pnpm

# Stage 2: Dependencies
FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 3: Build
FROM base AS build
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm build

# Stage 4: Production dependencies
FROM base AS prod-dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Stage 5: Deploy
FROM base AS deploy
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=prod-dependencies /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/seed_vehicles.json ./seed_vehicles.json

EXPOSE 3000

# Run seed script, then start NestJS application
CMD ["sh", "-c", "node dist/scripts/seed.js && node dist/src/main.js"]
