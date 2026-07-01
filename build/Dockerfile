FROM --platform=linux/amd64 debian:trixie-slim AS builder

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential curl ca-certificates xz-utils patch make llvm \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

ARG VERSION=5.42.0
ENV VERSION=${VERSION}
ARG SOURCE_SHA256=e093ef184d7f9a1b9797e2465296f55510adb6dab8842b0c3ed53329663096dc

ARG PERL_CROSS_VERSION=1.6.4
ARG PERL_CROSS_SHA256=b6202173b0a8a43fb312867d85a8cd33527f3f234b1b6e591cdaa9895c9920c7
ARG WASI_SDK_VERSION=27
ENV WASI_SDK_PATH=/opt/wasi-sdk

RUN mkdir -p /opt/wasi-sdk \
    && curl -fsSL "https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-${WASI_SDK_VERSION}/wasi-sdk-${WASI_SDK_VERSION}.0-x86_64-linux.tar.gz" \
       | tar -xzf - --strip-components=1 -C /opt/wasi-sdk

ARG WASM_TOOLS_VERSION=1.235.0
ARG WASMTIME_VERSION=45.0.0
RUN curl -fsSL "https://github.com/bytecodealliance/wasm-tools/releases/download/v${WASM_TOOLS_VERSION}/wasm-tools-${WASM_TOOLS_VERSION}-x86_64-linux.tar.gz" \
      | tar -xzf - --strip-components=1 -C /usr/local/bin "wasm-tools-${WASM_TOOLS_VERSION}-x86_64-linux/wasm-tools" \
    && wasm-tools --version \
    && curl -fsSL -o /opt/wasi_snapshot_preview1.command.wasm \
       "https://github.com/bytecodealliance/wasmtime/releases/download/v${WASMTIME_VERSION}/wasi_snapshot_preview1.command.wasm"

ADD https://www.cpan.org/src/5.0/perl-${VERSION}.tar.gz /src/perl.tar.gz
ADD https://github.com/arsv/perl-cross/releases/download/${PERL_CROSS_VERSION}/perl-cross-${PERL_CROSS_VERSION}.tar.gz /src/perl-cross.tar.gz
RUN echo "${SOURCE_SHA256}  /src/perl.tar.gz" | sha256sum -c - \
    && echo "${PERL_CROSS_SHA256}  /src/perl-cross.tar.gz" | sha256sum -c -

WORKDIR /build
RUN tar -xzf /src/perl.tar.gz -C /build --strip-components=1 \
    && tar -xzf /src/perl-cross.tar.gz -C /build --strip-components=1

COPY build/hints-wasi /build/cnf/hints/wasi

COPY build/wasi.patch /build/wasi.patch
RUN patch -p1 --fuzz=0 < wasi.patch

COPY build/wasi-stubs.c /build/wasi-stubs.c
RUN /opt/wasi-sdk/bin/clang --target=wasm32-wasip1 -O2 -c /build/wasi-stubs.c -o /build/wasi-stubs.o

ENV CFLAGS="--target=wasm32-wasip1 -O2 -D_WASI_EMULATED_SIGNAL -D_WASI_EMULATED_MMAN -D_WASI_EMULATED_PROCESS_CLOCKS -D_WASI_EMULATED_GETPID -mllvm -wasm-enable-sjlj -mllvm -wasm-use-legacy-eh=false -Wno-implicit-function-declaration -Wno-int-conversion -DNO_ENV_ARRAY_IN_MAIN"
ENV LDFLAGS="--target=wasm32-wasip1 /build/wasi-stubs.o -lwasi-emulated-signal -lwasi-emulated-mman -lwasi-emulated-process-clocks -lwasi-emulated-getpid -lsetjmp -Wl,-z,stack-size=8388608"

RUN CC="${WASI_SDK_PATH}/bin/clang" \
    AR="${WASI_SDK_PATH}/bin/llvm-ar" \
    NM="${WASI_SDK_PATH}/bin/llvm-nm" \
    RANLIB="${WASI_SDK_PATH}/bin/llvm-ranlib" \
    OBJDUMP="${WASI_SDK_PATH}/bin/llvm-objdump" \
    READELF="/usr/bin/llvm-readelf" \
    HOSTCC="cc" \
    ./configure \
      --target=wasm32-wasip1 \
      --prefix=/perl \
      --all-static \
      -Uusedl \
      -Dosname=wasi \
      -Dsysroot="${WASI_SDK_PATH}/share/wasi-sysroot" \
      -Dman1dir=none -Dman3dir=none

RUN make -j"$(nproc)"

RUN set -eu; for d in cpan/* dist/* ext/*; do \
      if [ -d "$d/lib" ]; then cp -a "$d/lib/." lib/; fi; \
    done

RUN make install

RUN set -eux \
    && mkdir -p /dist \
    && test "$(head -c8 /perl/bin/perl | od -An -tx1 | tr -d ' \n')" = "0061736d01000000" \
    && wasm-tools component new /perl/bin/perl \
         --adapt wasi_snapshot_preview1=/opt/wasi_snapshot_preview1.command.wasm \
         -o /dist/perl.wasm \
    && tar --exclude='*.a' --exclude='*.ld' -czf /dist/perllib.tar.gz -C /perl lib \
    && test "$(head -c8 /dist/perl.wasm | od -An -tx1 | tr -d ' \n')" = "0061736d0d000100" \
    && test "$(stat -c%s /dist/perl.wasm)" -gt 4194304

FROM scratch AS exportor
COPY --from=builder /dist /dist
