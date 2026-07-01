perl-wasm — Corresponding Source mirror
==================================================

This repository publishes the Corresponding Source for the WebAssembly
build of perl (license: Artistic-1.0-Perl/GPL-1.0-or-later) used in edgetools.io.

Contents
  build/      our build recipe: Dockerfile + helper scripts/config/patches.
              Rebuild with:  docker build build/
  upstream/   the exact upstream source archive(s) the build fetched,
              byte-identical and sha256-verified (see below).

Upstream sources:
  perl.tar.gz
    https://www.cpan.org/src/5.0/perl-5.42.0.tar.gz
    sha256 e093ef184d7f9a1b9797e2465296f55510adb6dab8842b0c3ed53329663096dc
  perl-cross.tar.gz
    https://github.com/arsv/perl-cross/releases/download/1.6.4/perl-cross-1.6.4.tar.gz
    sha256 b6202173b0a8a43fb312867d85a8cd33527f3f234b1b6e591cdaa9895c9920c7
