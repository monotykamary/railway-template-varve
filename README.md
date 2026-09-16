# Varve on Railway

**Time settles into layers.** A pinned deployment of the experimental [Varve](https://github.com/monotykamary/varve) Rust time-series database, with a persistent volume and a Railway S3-compatible bucket.

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/varve)

## What you get

```text
HTTPS / WSS → Varve service → /data persistent volume
                    │              local WAL + Parquet
                    └── async publication → objects bucket
```

- One database owner/replica, a generated operator token, public HTTPS and WebSocket endpoint.
- Local WAL, bounded ingestion/group commit, Parquet, continuous numeric aggregates and lifecycle scheduling.
- A dedicated bucket wired through Railway variable references—not copied credentials.
- A volume mounted at `/data`, with the database under `/data/varve` and daily backups configured in the template.
- Rust and TypeScript clients in the upstream repository. PostgreSQL-wire is opt-in and not publicly exposed by this template.

## Versions and source

`VERSION.json` pins the exact upstream commit and source-archive SHA-256. The Dockerfile builds that source with a digest-pinned Rust image and reuses the upstream entrypoint, configuration and licensing. The DuckDB v2 alpha binary is checksum-pinned by the upstream installer. No `latest` application tag or moving upstream branch is fetched.

Updating the wrapper does not silently update Varve. A version change requires a new source pin, checksum and complete validation. New grouped WAL records require a compatible Varve reader; do not roll back onto a namespace without a tested migration.

## First use

1. Deploy the template into your chosen workspace and wait for the Varve service to become healthy.
2. Retrieve `VARVE_API_TOKEN` from the Varve service variables. Treat it as an operator credential, not a tenant login.
3. Connect a client to `wss://<service-domain>/v1/ws`, or use the authenticated HTTPS API. Create a table explicitly, then write rows or atomic batches.
4. Follow [batching](https://github.com/monotykamary/varve/blob/main/docs/BATCHING.md), [client protocol](https://github.com/monotykamary/varve/blob/main/docs/CLIENT_PROTOCOL.md) and [operations](https://github.com/monotykamary/varve/blob/main/docs/OPERATIONS.md).

Browser clients require exact origins in `VARVE_WS_ORIGINS` and are for trusted operator frontends; never publish the operator token in a public app. Non-browser clients omit Origin. Tokens never belong in WebSocket URLs. The template does not automatically create a user table or enable destructive retention policies.

## Configuration and safety

`VARVE_USE_S3=true` enables remote protection. Keep the `objects` bucket references for endpoint, bucket name and access keys intact. Use a unique prefix for every independent database owner; restoring transfers ownership rather than creating an active replica.

An acknowledged write has passed **local fsync**, not necessarily S3 publication. Permanent loss of the volume can lose the unshipped tail. Monitor the recovery gap and take tested backups. Never run multiple replicas against this volume/bucket namespace.

This is an **experimental database and DuckDB-alpha dependency**, not a production/HA certification, untrusted SQL sandbox or PostgreSQL replacement. The current Railway limits target a small evaluation: 1,000 rows / 1 MiB per application batch, bounded memory/cache/query budgets and a 512 MiB logical local-disk budget. Raise limits deliberately and test realistic cardinality. Railway service, volume and bucket usage can incur charges.

## Validation

See [`VALIDATION.md`](VALIDATION.md) for the exact tested source, live deployment, protocol/auth/batch/recovery checks, delayed observations and cleanup outcome. The published topology is reproducible in [`template.json`](template.json); run `node scripts/check-pins.mjs` and `node scripts/check-template.mjs` to check it. Validation resources belong only to the Tom workspace; no permanent demo is attached.

## License and attribution

The wrapper and first-party Varve artwork are Apache-2.0. Upstream source: [monotykamary/varve](https://github.com/monotykamary/varve). DuckDB has its own MIT license, retained in the runtime image. No third-party logo has been modified or rebranded.
