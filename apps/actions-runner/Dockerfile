FROM --platform=linux/arm64 public.ecr.aws/lambda/nodejs:18

WORKDIR /runner

ARG RUNNER_VERSION="2.308.0"
ENV RUNNER_ALLOW_RUNASROOT=1

ENV PATH=$PATH:/usr/local/sbin:/usr/sbin:/sbin:/root/.pulumi/bin
ENV LD_LIBRARY_PATH=/usr/lib64

RUN yum update -y \
  && yum install -y \
    gcc \
    gcc-c++ \
    git \
    gzip \
    make \
    python3 \
    tar \
    zstd \
  && curl -fsSL https://github.com/actions/runner/releases/download/v$RUNNER_VERSION/actions-runner-linux-arm64-$RUNNER_VERSION.tar.gz | tar xz \
  && curl -fsSL https://cli.doppler.com/install.sh | sh \
  && curl -fsSL https://get.pulumi.com | sh \
  && corepack enable \
  && pnpm config set store-dir /runner/.pnpm \
  && yum clean all \
  && rm -rf /var/cache/yum

COPY dist/index.cjs /runner/index.js

ENTRYPOINT [""]
CMD ["node", "index.js"]
