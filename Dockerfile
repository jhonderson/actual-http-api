FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm ci --omit=dev

COPY . .

RUN chmod +x entrypoint.sh

ENV PORT=5007
ENV ACTUAL_DATA_DIR=/data
ENV NODE_ENV=production

EXPOSE ${PORT}

ENTRYPOINT [ "./entrypoint.sh" ]
