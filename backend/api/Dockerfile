# Stage 1: Build TypeScript
FROM node AS build
WORKDIR /app
COPY package*.json ./
RUN rm -rf node_modules && npm ci
COPY . .
RUN npm run build

# Stage 2: Production Image
FROM node
WORKDIR /app

# Nur notwendige Pakete installieren (keine DevDeps)
COPY package*.json ./
RUN npm ci --omit=dev
RUN npm run generateDB

# PM2 global installieren
RUN npm install -g pm2

# Kopiere nur das gebaute JS
COPY --from=build /app/dist ./dist

# Starte über PM2
CMD ["pm2-runtime", "dist/backend/src/app.js"]
