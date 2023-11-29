FROM public.ecr.aws/docker/library/node:20-slim AS base

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    openssl \
    tini \
  && rm -rf /var/lib/apt/lists/*

# ---

FROM base as build-base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable
RUN pnpm add -g turbo

# ---

FROM build-base as source
WORKDIR /app

COPY . .

ARG APP
RUN turbo prune --docker @penxle/${APP}

# ---

FROM build-base AS deps
WORKDIR /app

COPY --from=source /app/out/json/ .
RUN mkdir -p packages/glitch/bin packages/lambda/bin \
  && touch packages/glitch/bin/index.js packages/lambda/bin/index.js

RUN pnpm install --frozen-lockfile

# ---

FROM build-base AS build
WORKDIR /app

COPY --from=deps /app/ .
COPY --from=source /app/out/full/ .

ARG APP
RUN turbo build --filter=@penxle/${APP}...

# ---

FROM base AS runner
WORKDIR /app

ARG APP
COPY --from=build --chown=1000 /app/apps/${APP}/dist/ .

USER 1000
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "index.js"]
