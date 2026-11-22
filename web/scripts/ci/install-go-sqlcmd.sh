#!/usr/bin/env bash
# Installs Microsoft's Go-based sqlcmd (github.com/microsoft/go-sqlcmd) on a
# Linux x64 GitHub runner, pinned to one release, and puts it on PATH for
# later steps. Used by the "Sync live data" workflow (dump-legacy.ps1 needs
# sqlcmd) and by CI's dump-script check.
set -euo pipefail

version="${GO_SQLCMD_VERSION:-v1.8.2}"
dest="${RUNNER_TEMP:-/tmp}/go-sqlcmd"
mkdir -p "$dest"
curl -fsSL --retry 3 -o "$dest/sqlcmd.tar.bz2" \
  "https://github.com/microsoft/go-sqlcmd/releases/download/${version}/sqlcmd-linux-amd64.tar.bz2"
tar -xjf "$dest/sqlcmd.tar.bz2" -C "$dest"
rm "$dest/sqlcmd.tar.bz2"
chmod +x "$dest/sqlcmd"
"$dest/sqlcmd" --version
if [ -n "${GITHUB_PATH:-}" ]; then
  echo "$dest" >> "$GITHUB_PATH"
fi
