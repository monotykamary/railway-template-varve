# Template release acceptance

Verified 2026-09-16 in **Tom**, workspace `18857f84-0af6-4379-9217-e62e2d14b48f`. Only new release-owned resources were used; the existing Varve evaluation was not modified.

| Gate | Evidence | State |
| --- | --- | --- |
| Pinned source | Varve `45d7c014ea9070e6a2f299a752c121c748434762`; SHA-256 `05d2432253724e9c53a070a66f2fdd928af3927241fb0a4fc439690e3e3eee5c`; digest-pinned base images; DuckDB `v2.0.0-alpha41533` / `10de957379` | passed |
| Local/Linux behavior | Full upstream verification and SDK/browser probes; corrected Linux CI [35055893569](https://github.com/monotykamary/varve/actions/runs/35055893569) passed; both Cargo publication tarballs verified | passed |
| Icon | First-party transparent 512px mark, alpha bounds 416x416; exact pinned icon loaded at 512x512 in the rendered card and service node | passed |
| Live stack | One service, `/data` volume and `objects` bucket in `sin`; explicit `/ready` health check; process UID/GID 10001 verified | passed |
| Product probes | 37 exact rows, sum 83.25, 32 pipelined single inserts, atomic HTTP/WS batches, duplicate receipts, exact `9007199254740993n` SQL and matching rollups | passed |
| Real S3 | Isolated 256-row provider probe: immutable/conditional writes, stale CAS, token freshness, paging/deletion, fsync, Parquet, archive, SQL, named rollup, restore, raw/derived retention and vacuum | passed |
| Soak/redeploy | 121.010s / 12 samples before and 121.906s / 12 samples after redeploy; all 37 rows, rollups and HTTP duplicate receipt retained; local/checkpoint/remote sequence 6; 2 segments | passed |
| Safe template | Exact config readback, generated token, bucket references, 13 described variables, daily backup schedule, one replica, no validation secrets, `demoProjectId: null` | passed |
| Public route | [Varve](https://railway.com/deploy/varve), template `d38051a6-00ca-4156-93de-383be81a2af3`, creator Tom, source/version/topology/card verified in a background browser target | passed; remote button verification follows push |
| Cleanup | Release-owned project deletion and deployment/domain readback | pending final cleanup |

## Exact live identity

- Project: `c4a086d0-f659-47f7-b688-7222f61d508f`.
- Environment: `6d42a262-14c6-4be9-8878-70d814f4e987`.
- Service: `3ddb2967-d7ea-400b-b547-63257e70560e`.
- Volume: `54c3cd3f-1876-496a-8e5a-50e43bacdc52`.
- Bucket: `632dbc64-fa88-4143-94e5-4865b65926f5`.
- Tested wrapper runtime commit: `f273c388360ff8e383df62424ed6bf7cac86cba4`.
- Initial healthy deployment: `a17a3a1e-91c8-4dd4-83b7-c38fcf84fc5c`.
- Healthy persistence redeploy: `be5cb45a-d17c-4763-a536-5351076077a9`.

Subsequent documentation/template-metadata commits do not change the Dockerfile, capacity file, source pin or runtime artifact. Watch patterns exclude these cosmetic updates.

## Diagnosed failures and boundaries

The first raw bucket definition had no production instance, so its references resolved empty. The explicit health gate rejected deployment `94f348ed-a301-46af-9de3-3234087d26f2`. The CLI's actual bucket implementation requires an environment patch with `region: sin` and `isCreated: true`; that instance was provisioned, every S3 reference was checked, and the corrected image passed both live windows. Earlier non-health-gated starts were not accepted as readiness evidence.

`Database::is_ready` intentionally uses `try_lock`. The first strict soak attempt saw a 1ms upstream `503 {"ready":false}` during mutex contention, not an edge failure or crash. The corrected oracle counts and bounds that documented condition, requires live `/health`, eventual readiness, exact SQL data and no fencing/maintenance error. The successful initial window recorded one busy response, with maximum readiness acquisition 513ms; the post-redeploy window recorded zero. This is not a zero-error-rate or throughput/SLO claim.

The public page rendered in Railway's dark theme. A light media preference did not change the page's explicit `dark` theme, so no separate light-theme page verification is claimed. The source icon's transparent bounds and contrast were checked separately.

## Tooling and safety

CLI 5.54.0 lacks workspace selection on several template commands. Project/template-ID-scoped public operations were guarded by exact Tom workspace readback; internal config upsert and public publish explicitly supplied Tom's workspace ID. The internal endpoint was used only for configuration unavailable through supported CLI commands. No browser cookies or tokens were extracted or printed.

No local container images were built, as required by upstream guidance. Railway supplied the Linux/container gate. This remains the explicitly experimental Varve/DuckDB-alpha edition, not a stable-production or HA certification. No permanent demo is attached.
