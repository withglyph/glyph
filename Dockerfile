FROM public.ecr.aws/docker/library/node:20-alpine AS base

RUN apk add --no-cache \
  g++ \
  make \
  python3 \
  && rm -rf /var/cache/apk/*

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

RUN pnpm add -g turbo

# ---

FROM base as prepare
WORKDIR /app

COPY . .

ARG APP
RUN turbo prune --docker @penxle/${APP}

# ---

FROM base AS deps
WORKDIR /app

COPY --from=prepare /app/out/json/ .
RUN mkdir -p packages/glitch/bin packages/lambda/bin \
  && touch packages/glitch/bin/index.js packages/lambda/bin/index.js

RUN pnpm install --frozen-lockfile

# ---

FROM base AS build
WORKDIR /app

COPY --from=deps /app/ .
COPY --from=prepare /app/out/full/ .

ARG APP
RUN turbo build --filter=@penxle/${APP}...

# ---

FROM base AS runner
WORKDIR /app

ARG APP
COPY --from=build /app/apps/${APP}/dist/ .

CMD ["node", "index.js"]
