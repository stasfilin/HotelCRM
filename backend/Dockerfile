FROM node:20-slim AS build

WORKDIR /backend

COPY package*.json ./

RUN npm install

COPY . .

FROM node:20-slim

RUN apt-get update && apt-get install -y openssl

WORKDIR /backend

COPY --from=build /backend .

EXPOSE 9090
ENTRYPOINT ["/backend/docker-entrypoint.sh"]
