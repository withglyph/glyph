FROM --platform=linux/arm64 ubuntu:latest

ARG RUNNER_VERSION="2.308.0"

WORKDIR /runner
RUN useradd -d /runner runner

RUN sed -i -e \
  's#http://ports.ubuntu.com/ubuntu-ports/#http://mirror.yuki.net.uk/ubuntu-ports/#' \
  /etc/apt/sources.list

RUN apt-get update && apt-get install -y --no-install-recommends \
  ca-certificates \
  curl \
  && apt-get autoremove -y \
  && apt-get autoclean -y \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

RUN apt-get update && apt-get install -y --no-install-recommends \
  build-essential \
  git \
  nodejs \
  python3 \
  zstd \
  && apt-get autoremove -y \
  && apt-get autoclean -y \
  && rm -rf /var/lib/apt/lists/*

RUN curl \
  -o actions-runner.tar.gz \
  -L https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-arm64-${RUNNER_VERSION}.tar.gz \
  && tar xzf ./actions-runner.tar.gz \
  && rm -f ./actions-runner.tar.gz

RUN ./bin/installdependencies.sh \
  && apt-get autoremove -y \
  && apt-get autoclean -y \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir /runner/_work && chown runner:runner /runner/_work
ADD --chown=runner dist/tool-cache.tar.gz /runner/_work/_tool

COPY dist/index.js ./index.mjs

USER runner
ENTRYPOINT ["node", "index.mjs"]
