FROM --platform=linux/arm64 node:18
WORKDIR /deps

ENV PNPM_HOME="/pnpm"
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/pnpm pnpm fetch

# RUN pnpm install --offline
