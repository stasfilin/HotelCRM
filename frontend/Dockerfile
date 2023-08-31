FROM node:alpine AS dev
ENV NODE_ENV dev

WORKDIR /frontend
COPY ./package.json /frontend
RUN npm install
COPY . .

CMD npm start