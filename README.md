## About

Basic HTTP Api wrapping the [Actual Budget](https://actualbudget.org/) [NodeJS api](https://actualbudget.org/docs/api/).

## Why?

Interoperability mostly. Useful for scenarios where you want to interact with your Actual server instance but you can't import a Node.js library (let's say you are using another programming language).

## Usage

To host this server you can run it either with Node.js or Docker. You will need the following environment variables:
- `ACTUAL_SERVER_URL`: Url of your Actual Budget server instance
- `ACTUAL_SERVER_PASSWORD`: Password of your Actual Budget server
- `API_KEY`: A string secret used to give access to clients of this API. Unlike typical Api Keys, this one is not used to identify the caller since the basic authorization method of this api doesn't allow multiple api keys, it's just one for every caller. You can generate one however you want, I use `apg -m 50 -n 1`

To start the server using the local code with Node.js, define your environment variables in the `.env` file and then run:
```bash
npm install
node server.js
```

Or run the public docker image using docker run command:
```bash
docker run -d --name actualhttpapi -v ./data:/data:rw -p 5007:5007 \
  -e 'ACTUAL_SERVER_URL=http://localhost:5006/' \
  -e 'ACTUAL_SERVER_PASSWORD=my-actual-server-password' \
  -e 'API_KEY=my-strong-api-key' \
  --restart=on-failure jhonderson/actual-http-api:latest
```

Or run it using docker compose:
```bash
docker-compose up -d
```

## Documentation

Once the service is up, see the documentation in http://localhost:5007/api-docs/

## Improvements

This projects is missing:
- Unit tests
- End to end tests
- Analysis about what happens when concurrent calls are made to the http api.
