FROM node:20

RUN npm install -g nodemon typescript ts-node
WORKDIR /app
COPY . /app
RUN npm i

CMD ts-node src/index.ts
