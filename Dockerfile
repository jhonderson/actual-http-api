FROM node:22-alpine AS build_image

WORKDIR /usr/src/app

# better-sqlite3 may need to compile its native bindings
RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

FROM node:22-alpine AS runner_image

WORKDIR /usr/src/app

COPY --from=build_image /usr/src/app/node_modules ./node_modules

ADD src ./src
ADD package*.json server.js entrypoint.sh ./

RUN chmod +x entrypoint.sh

ENV PORT=5007
ENV ACTUAL_DATA_DIR=/data
ENV NODE_ENV=production

EXPOSE ${PORT}

ENTRYPOINT ["./entrypoint.sh"]