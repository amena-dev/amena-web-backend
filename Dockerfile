FROM node:15-alpine

WORKDIR /src
COPY package.json /src
COPY package-lock.json /src
RUN npm i . --save

COPY . /src
EXPOSE 3000

RUN npm run build
CMD npm run start