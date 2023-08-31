FROM node:20

WORKDIR /backend

COPY . .

RUN chmod +x docker-entrypoint.sh

RUN npm install

EXPOSE 9090

ENTRYPOINT ["/backend/docker-entrypoint.sh"]