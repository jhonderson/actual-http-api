# Usage Examples

## Backup script

**Description:** A bash script to back up the Actual budget into a desired destination.

**Location:** [examples/budget_backup.sh](examples/budget_backup.sh)

## Fly deployment (fly.toml)

**Description:** Example `fly.toml` for deploying this service as a Docker container on Fly.io.

**Required secrets:** `ACTUAL_SERVER_PASSWORD`, `API_KEY` (create these in the Fly console or via `fly secrets`).

**Location:** [examples/fly.toml](examples/fly.toml)

### Notes

- The `budget_backup.sh` script is a simple example — review and adapt it for your backup destination and scheduling.
- When deploying on Fly.io, store `ACTUAL_SERVER_PASSWORD` and `API_KEY` as secrets so credentials are not checked into source control.
