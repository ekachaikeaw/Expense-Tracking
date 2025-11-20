FROM --platform=linux/amd64 node:22.18

WORKDIR /usr/src/app

ADD . .

COPY .env* ./

RUN npm ci

RUN npm run build

CMD ["node", "dist/index.js"]