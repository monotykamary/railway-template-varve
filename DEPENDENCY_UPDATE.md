# Dependency candidate — 2026-11-15

Advance only the build toolchain from stable Rust 1.98.1 to stable Rust 1.100.0, pinned by exact image digest. The Varve source archive/commit/checksum, experimental application version, checksum-pinned DuckDB alpha dependency and Debian runtime digest remain unchanged. Stable compiler status does not make the experimental database production-certified.

The product check speaks the documented authenticated `varve.v1` WebSocket JSON-RPC protocol. It creates a unique table, writes one synthetic row using an explicit request ID, retrieves that exact row with SQL after upgrade and redeploy without reseeding, and exercises checkpoint. A wrong HTTP operator token must be rejected. Checkpoint acceptance is not a certification of remote S3 durability; local acknowledgment remains distinct from remote protection.

The immutable source, all production FROM digests, volume ownership and single-replica topology are retained. Full boat and live Railway results remain publication prerequisites.
