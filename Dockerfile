FROM --platform=linux/amd64 node:18-alpine as ric

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN apk add --no-cache \
  autoconf \
  automake \
  cmake \
  g++ \
  libtool \
  make \
  python3

RUN apk add --no-cache --update --repository=https://dl-cdn.alpinelinux.org/alpine/v3.16/main/ \
  libexecinfo-dev

RUN corepack enable
RUN pnpm add -g aws-lambda-ric

FROM --platform=linux/amd64 node:18-alpine as turbo

WORKDIR /build
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable
RUN pnpm add -g turbo

COPY . .

ARG PROJECT_NAME
RUN turbo prune --scope @penxle/$PROJECT_NAME --docker

FROM --platform=linux/amd64 node:18-alpine as builder

WORKDIR /build

RUN apk add --no-cache \
  autoconf \
  automake \
  cmake \
  g++ \
  libtool \
  make \
  python3

RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub \
  && echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | tee -a /etc/apk/repositories \
  && apk add doppler

RUN corepack enable

COPY --from=turbo /build/out/pnpm-lock.yaml ./
RUN pnpm fetch

COPY --from=turbo /build/out/json/. ./
RUN pnpm install --frozen-lockfile --offline

ARG PROJECT_PATH
ARG TURBO_TEAM
ARG TURBO_TOKEN
ARG DOPPLER_TOKEN
ARG DOPPLER_PROJECT
ARG DOPPLER_CONFIG

COPY --from=turbo /build/out/full/. ./
RUN cd $PROJECT_PATH && doppler run -- pnpm exec turbo build

FROM --platform=linux/amd64 node:18-alpine

WORKDIR /app

COPY --from=ric /pnpm/aws-lambda-ric ./pnpm/aws-lambda-ric
COPY --from=ric /pnpm/global ./pnpm/global

ARG PROJECT_PATH
COPY --from=builder /build/$PROJECT_PATH/.lambda/. ./

ENTRYPOINT ["/app/pnpm/aws-lambda-ric"]
CMD ["handler.handler"]
