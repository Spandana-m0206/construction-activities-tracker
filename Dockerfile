# Stage 1: Build
FROM node:latest AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Stage 2: Production
FROM gcr.io/distroless/nodejs:latest

WORKDIR /app

COPY --from=build /app /app

EXPOSE 3000

CMD ["src/index.js"]