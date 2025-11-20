FROM --platform=linux/amd64 node:latest

WORKDIR /usr/src/app

ADD . .

RUN npm ci

RUN npm run build

CMD ["node", "dist/index.js"]