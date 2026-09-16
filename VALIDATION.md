# Template release acceptance

Workspace: **Tom**, `18857f84-0af6-4379-9217-e62e2d14b48f`. Only new release-owned validation resources may be mutated. The existing Varve evaluation is not reused or modified.

| Gate | Evidence | State |
| --- | --- | --- |
| Pinned source | Upstream commit, archive SHA-256, base digests, DuckDB pin | pending |
| Local behavior | Full upstream Rust/TypeScript tests, client/transport/batching probes, shell/config checks | pending |
| Icon | First-party transparent 512px mark; alpha bounds 416x416 (81.25%); dark/light contrast | local icon inspected |
| Live stack | One service + /data volume + objects bucket; workspace and exact deployment readback | pending |
| Product probes | Auth rejection, HTTP/WS clients, explicit batches, concurrent inserts, S3 recovery, exact data oracle | pending |
| Soak/redeploy | Two-minute steady-state window, recurring maintenance; redeploy same artifact, exact data retained; repeat observation | pending |
| Safe template | Generated token, bucket references, daily volume backup, one replica, no test secrets, no demo project | pending |
| Public route | Rendered title/creator/source/version/topology; remote README button | pending |
| Cleanup | Task-owned project soft-deleted, deployments removed, domain unavailable | pending |

CLI 5.54.0 lacks `--workspace` on `templates create` and `add`. For those operations use project-ID-scoped GraphQL after verifying that the project belongs to Tom; all commands accepting workspace selection use Tom explicitly. This avoids relying on a linked project or silently selecting another workspace.

No local container images are built: upstream repository guidance prohibits containers and asks to keep build artifacts small. Railway's isolated build supplies the Linux/container gate. The experimental prerequisite is intentional because the user is requesting a template for the existing experimental Varve project; no stable-release certification is claimed.
