# Deploy and Host Varve on Railway

Time settles into layers. Varve is an experimental Rust time-series database with DuckDB SQL, bounded group-commit ingestion, continuous numeric aggregates, tiered Parquet storage and asynchronous S3 WAL/checkpoints.

## About Hosting Varve

This template deploys one Varve service, one persistent `/data` volume and a dedicated `objects` bucket. The service owns the public HTTPS domain and WebSocket endpoint at `/v1/ws`. It generates an operator API token; there is no default username/password or web administration console. Obtain the token from `VARVE_API_TOKEN` in the service variables, then create a table using a client or the operator API.

`/health` is liveness. `/ready` is a nonblocking storage-state check and may briefly return 503 during normal mutex contention; clients should use bounded readiness acquisition, not treat every busy sample as a crash. Browser clients require exact origins in `VARVE_WS_ORIGINS` and are for trusted operator frontends—never embed the operator token in a public app.

A local acknowledgment is **not an S3 acknowledgment**. Do not deploy irreplaceable data without independent backups and a tested restore plan. No automatic failover or multi-replica database ownership is implemented.

## Common Use Cases

- Evaluate local-first time-series ingestion and DuckDB analytical SQL.
- Submit explicit atomic batches, or pipeline bounded single inserts through a persistent connection.
- Keep derived numeric history while expiring raw data through explicit policies.
- Explore a small, modular Rust storage stack without PostgreSQL server compatibility requirements.

## Dependencies for Varve Hosting

### Deployment Dependencies

- One Railway service with a public HTTPS domain.
- One volume mounted at `/data`; Varve refuses ephemeral storage by default.
- One Railway S3-compatible bucket, connected through variable references.
- Generated `VARVE_API_TOKEN` and explicit allowed origins for browser clients.

### Implementation Details

Pinned release: **Varve v0.1.0 — `45d7c014ea90`**. The source revision and archive SHA-256 are pinned in the wrapper's `VERSION.json` and Dockerfile. Rust and runtime base images use digest pins; the upstream installer pins DuckDB v2 alpha by commit and checksum. This is the explicitly experimental Varve/DuckDB-alpha edition, not a stable-production template.

The database runs as UID/GID 10001 after volume initialization. The volume stores local WAL and Parquet; scheduled publication protects immutable data and recovery state in the bucket. Daily volume backups are configured. Service/bucket secrets are generated or referenced, never copied from validation.

Use [Varve's Rust and TypeScript clients](https://github.com/monotykamary/varve), its authenticated HTTP API or CLI. PostgreSQL-wire is a separate opt-in subset and is not publicly exposed by this template. There is no arbitrary relational schema, general SQL incremental-view engine or tenant-authentication boundary.

The initial capacity configuration allows up to 1,000 rows and 1 MiB per application batch, with bounded hot/cache/query budgets and a 512 MiB logical local-disk limit. These are admission limits, not OS quotas. The template creates no destructive retention policy automatically. Keep exactly one database replica and preserve the bucket reference variables.

### Why Deploy Varve on Railway?

Railway supplies HTTPS/WSS termination, a persistent volume, bucket provisioning and reference wiring in one deployment. It makes the experimental stack easy to try while leaving the storage and durability boundaries explicit. Service, volume and bucket usage may incur charges.

Source and operations: [Varve](https://github.com/monotykamary/varve) · [pinned wrapper](https://github.com/monotykamary/railway-template-varve) · Apache-2.0. DuckDB's separate MIT license is retained in the image.
