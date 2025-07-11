FROM node:20-alpine AS BUILD_IMAGE

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production
RUN npm ci --omit=dev

COPY . .

FROM node:20-alpine AS RUNNER_IMAGE

WORKDIR /usr/src/app

COPY --from=BUILD_IMAGE /usr/src/app/node_modules ./node_modules
ADD src ./src
ADD package*.json server.js entrypoint.sh ./

RUN chmod +x entrypoint.sh

ENV PORT=5007
ENV ACTUAL_DATA_DIR=/data
ENV NODE_ENV=production

EXPOSE ${PORT}

ENTRYPOINT [ "./entrypoint.sh" ]
