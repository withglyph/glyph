FROM public.ecr.aws/docker/library/node:20 AS build
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    cmake \
  && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

COPY pnpm-lock.yaml .
RUN pnpm fetch

COPY . .

RUN pnpm install --frozen-lockfile --offline

ARG APP
ARG TURBO_TEAM
ARG TURBO_TOKEN
ENV TURBO_TEAM=${TURBO_TEAM}
ENV TURBO_TOKEN=${TURBO_TOKEN}
ENV NODE_ENV=production

RUN cd apps/${APP} && pnpm turbo build
RUN pnpm deploy --filter=@penxle/${APP} --prod out

# ---

FROM public.ecr.aws/docker/library/node:20-slim AS runner
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    libvips \
    tini \
  && rm -rf /var/lib/apt/lists/*

ARG APP
ENV NODE_ENV=production

COPY --from=build --chown=1000 /app/out/ .

USER 1000
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "dist/index.js"]
