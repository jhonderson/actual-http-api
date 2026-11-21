## About

Basic HTTP Api wrapping the [Actual Budget](https://actualbudget.org/) [NodeJS api](https://actualbudget.org/docs/api/).
# actual-http-api

Lightweight HTTP wrapper around the Actual Budget Node.js API. Exposes a simple REST interface so non-Node apps can interact with an Actual server.

## Quick Start — Run the public Docker image

Use the publicly published Docker image (replace the tag with the desired version):

```bash
docker run -d --name actualhttpapi \
  -v "$PWD/data:/data:rw" \
  -p 5007:5007 \
  -e ACTUAL_SERVER_URL="http://actual-server:5006/" \
  -e ACTUAL_SERVER_PASSWORD="your-actual-password" \
  -e API_KEY="your-api-key" \
  jhonderson/actual-http-api:26.10.0
```

- Replace `jhonderson/actual-http-api:26.10.0` with the specific tag you want.
- The service exposes the Swagger UI at `http://localhost:5007/api-docs/` by default (see swagger env vars below if you need to change how docs are served).

Tip: For secrets you can also mount files and use the `_PATH` variant of the environment variables (see `API_KEY_PATH` / `ACTUAL_SERVER_PASSWORD_PATH`).

## Local development (two options)

1) Run with Docker Compose

```bash
docker-compose up -d
```

This will start the service using the `docker-compose.yml` configuration in this repo. Adjust envs in the compose file or override with an `.env` file.

2) Run directly with Node.js

```bash
npm install
npm start
# or
node server.js
```

Create a `.env` file in the project root for local development environment variables (the project loads `.env` when `NODE_ENV !== 'production'`).

## Environment variables

The service reads several environment variables (from `src/config/config.js`). Defaults are shown where applicable.

- `API_KEY` (required) or `API_KEY_PATH` — SECRET API key string used by clients to authenticate to this wrapper.
  - Important: `API_KEY` must be generated and kept secret by the person deploying this service (for example with a random generator). It authenticates callers of the HTTP wrapper only — it is NOT a credential from the Actual Budget server.
  - You can provide the key directly via `API_KEY` or place it in a file and point to it with `API_KEY_PATH` (useful for Docker secrets).
- `ACTUAL_SERVER_PASSWORD` or `ACTUAL_SERVER_PASSWORD_PATH` — Password for the Actual server. Can be provided directly or via a file path. Required unless `ACTUAL_SERVER_SESSION_TOKEN` is set.
- `ACTUAL_SERVER_SESSION_TOKEN` or `ACTUAL_SERVER_SESSION_TOKEN_PATH` — An Actual session token (or Actual API key) to sign in to the Actual server instead of the password, see [Signing in with a token instead of the password](#signing-in-with-a-token-instead-of-the-server-password). Set one of the password or the token, not both.
- `ACTUAL_SERVER_URL` (required) — Base URL of your Actual server (e.g. `http://actual-server:5006/`).
- `ACTUAL_DATA_DIR` (optional) — Path to the Actual server data directory (used if you need to point at local data).
- `PORT` (optional) — Port this service listens on. Default: `5007`.
- `NODE_ENV` (optional) — Node environment (e.g. `production`, `development`). If not `production`, `.env` will be loaded by `dotenv`.

Swagger / API docs configuration (defaults used to build the docs URL shown in the UI):
- `SWAGGER_PROTOCOL` — Default: `https`
- `SWAGGER_HOST` — Default: `localhost`
- `SWAGGER_PORT` — Default: `443`
- `SWAGGER_BASE_PATH` — Default: `v1`

Notes:
- `API_KEY`, `ACTUAL_SERVER_PASSWORD` and `ACTUAL_SERVER_SESSION_TOKEN` are loaded using a helper that accepts either the value itself or a path to a file by appending `_PATH` to the variable name (useful for Docker secrets).
- If you run the container mapping port `5007` to the host (common for local runs), set `SWAGGER_PROTOCOL=http` and `SWAGGER_PORT=5007` if you want the Swagger UI links to reflect your local address.

### Experimental / unofficial operations

- `EXPERIMENTAL_OPERATIONS_ENABLED` (optional) — Toggle to enable experimental endpoints that rely on Actual internals. Defaults to enabled (true). Set to `false` to disable these endpoints; when disabled the HTTP server will respond with `501 Not Implemented` for those operations and they will be hidden from the Swagger UI.

### Signing in with a token instead of the server password

If your Actual server signs users in through OpenID (for example Pocket ID, Authentik or Keycloak), the server password is only a fallback and this service cannot go through the browser sign-in. Instead of `ACTUAL_SERVER_PASSWORD` you can give it a token that Actual accepts as a login:

```bash
docker run -d --name actualhttpapi \
  -v "$PWD/data:/data:rw" \
  -p 5007:5007 \
  -e ACTUAL_SERVER_URL="http://actual-server:5006/" \
  -e ACTUAL_SERVER_SESSION_TOKEN="your-actual-token" \
  -e API_KEY="your-api-key" \
  jhonderson/actual-http-api:26.10.0
```

Leave `ACTUAL_SERVER_PASSWORD` unset: the service refuses to start if both are set. The token is passed to the Actual library as its `sessionToken`.

- **Session token.** Sign in to Actual in a browser and copy the token it stores (`user-token`). It expires according to the server's `ACTUAL_TOKEN_EXPIRATION` setting, so use `never` or a long duration for an unattended service. Once it expires the service fails to authenticate until you replace the token. Turning OpenID on in Actual clears all sessions, so copy the token afterwards.
- **Actual API key.** Newer Actual servers can create API keys limited to specific budgets, which are sent the same way. They are the better choice where available, because they only reach the budgets they were created for and can be revoked without signing you out. Operations that need more than access to an existing budget (such as importing a new budget) may be refused for a scoped key.

### Importing a budget

`POST /v1/budgets/import` accepts an Actual export or a YNAB4/YNAB5 file as the raw request body, with `Content-Type: application/zip` or `application/octet-stream`, and returns the sync id of the imported budget.

Importing a budget that already exists does **not** restore it in place. The Actual library clears the file's server identity on import, so the budget is uploaded to your Actual server as a new file and receives a **new sync id**. The original budget and its sync id are left untouched, so you end up with two budgets rather than one. Use the `syncId` returned in the response to address the imported budget.

```bash
curl -X POST 'http://localhost:5007/v1/budgets/import?type=actual' \
  -H 'x-api-key: your-api-key' \
  -H 'Content-Type: application/zip' \
  --data-binary '@2026-09-06-My-Budget.zip'
```

## Documentation

When running locally with default port mapping, open:

```
http://localhost:5007/api-docs/
```

## Troubleshooting

- If the server fails to start due to missing secrets, ensure `API_KEY` and either `ACTUAL_SERVER_PASSWORD` or `ACTUAL_SERVER_SESSION_TOKEN` (or their `_PATH` equivalents) are provided.
- For production, run with `NODE_ENV=production` and provide secrets via a secrets manager or the `_PATH` pattern.

## Development

- Run unit tests:

```bash
npm test
```

## Usage Examples

See [USAGE_EXAMPLES.md](examples/USAGE_EXAMPLES.md) for ready-to-use use cases:
- [budget_backup.sh](examples/budget_backup.sh): Backup your Actual Budget using a bash script
- [fly.toml](examples/fly.toml): Configuration file to deploy actual-http-api to Fly.io
- [update_account_balances.py](examples/update_account_balances.py): Script to update your investment account balances in Actual Budget (this script can only be used with actual-http-api version 26.4.0 and onwards)
