ARG VARVE_COMMIT=f8dae37983c63f6ad5217445b12f4eb51ccc9f64
ARG VARVE_SOURCE_SHA256=a14533ebf9adbb286d73b8f75f514251d4f53be67c0e6a16df1b49765f6eb848

FROM rust:1.98.1-slim-bookworm@sha256:ebd900bae66fd508b466cef82d64a83a5fb34682e4c8b2797a42908bddc95a57 AS build
ARG VARVE_COMMIT
ARG VARVE_SOURCE_SHA256
RUN apt-get update && apt-get install -y --no-install-recommends build-essential cmake pkg-config ca-certificates curl && rm -rf /var/lib/apt/lists/*
WORKDIR /src
RUN curl --fail --show-error --location --retry 3 "https://codeload.github.com/monotykamary/varve/tar.gz/${VARVE_COMMIT}" -o /tmp/varve.tar.gz \
    && printf '%s  /tmp/varve.tar.gz\n' "$VARVE_SOURCE_SHA256" | sha256sum -c - \
    && tar -xzf /tmp/varve.tar.gz --strip-components=1 -C /src \
    && rm /tmp/varve.tar.gz
RUN scripts/install-duckdb.sh
RUN cargo build --locked --release --bin varve --example cloud_probe && mkdir -p /out && cp target/release/varve /out/varve && cp target/release/examples/cloud_probe /out/varve-cloud-probe && strip /out/varve /out/varve-cloud-probe

FROM debian:bookworm-slim@sha256:88200866dfff7ea7f5cbcb6ec7c8a701889efe6fe859fe64d6990e4b07ea4171
ARG VARVE_COMMIT
LABEL org.opencontainers.image.source="https://github.com/monotykamary/varve" org.opencontainers.image.revision="$VARVE_COMMIT" org.opencontainers.image.licenses="Apache-2.0"
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates libstdc++6 curl gosu util-linux python3 && rm -rf /var/lib/apt/lists/* && groupadd --gid 10001 varve && useradd --uid 10001 --gid 10001 --no-create-home --shell /usr/sbin/nologin varve
COPY --from=build /out/varve /usr/local/bin/varve
COPY --from=build /out/varve-cloud-probe /usr/local/bin/varve-cloud-probe
COPY --from=build /src/.tools/duckdb /usr/local/bin/duckdb
COPY --from=build /src/scripts/container-entrypoint.sh /usr/local/bin/varve-entrypoint
COPY --from=build /src/scripts/stress.py /src/scripts/verify-stress.py /app/scripts/
COPY --from=build /src/config/railway.json /app/config.json
RUN chmod 755 /usr/local/bin/varve-entrypoint && mkdir -p /data
COPY --from=build /src/LICENSE /usr/share/doc/varve/LICENSE
COPY --from=build /src/licenses/duckdb.txt /usr/share/doc/varve/licenses/duckdb.txt
WORKDIR /app
ENV VARVE_DATA_DIR=/data/varve VARVE_CONFIG=/app/config.json VARVE_REQUIRE_VOLUME=1
EXPOSE 8080
STOPSIGNAL SIGTERM
ENTRYPOINT ["/usr/local/bin/varve-entrypoint"]
