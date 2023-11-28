FROM --platform=linux/amd64 alpine

RUN apk add --no-cache \
  curl \
  g++ \
  libevent-dev \
  make \
  pkgconf \
  openssl-dev \
  && rm -rf /var/cache/apk/*

WORKDIR /build

RUN curl -sSfL https://www.pgbouncer.org/downloads/files/1.21.0/pgbouncer-1.21.0.tar.gz | tar xz --strip-components=1 \
  && ./configure --prefix=/app \
  && make \
  && make install \
  && rm -rf /build

WORKDIR /app

USER 1000
CMD ["bin/pgbouncer", "/conf/pgbouncer.ini"]
