FROM --platform=linux/arm64 node:18
WORKDIR /deps

RUN corepack enable

COPY _workspace/pnpm-lock.yaml .
RUN pnpm fetch

COPY _workspace/json .
RUN pnpm install
