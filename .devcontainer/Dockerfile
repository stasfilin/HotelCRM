ARG VARIANT=20-bullseye
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:${VARIANT}

RUN apt-get update -y
RUN apt-get install -y git docker.io docker-compose

EXPOSE 8000
EXPOSE 35729
EXPOSE 3000
EXPOSE 1313