#!/usr/bin/env bash
# CI check that dump-legacy.ps1 works on a Linux runner under PowerShell 7,
# the way the "Sync live data" workflow runs it, without the live database:
#   1. the script parses under pwsh;
#   2. the real go-sqlcmd, run with the script's flags against the CI SQL
#      Server container, writes the UTF-8, separator-delimited rows it parses;
#   3. the whole dump runs against fake-sqlcmd.sh and writes the CSVs and
#      manifest.json the loader expects;
#   4. migrate-data.ts --dry-run reads those CSVs and matches the manifest.
# Run from web/ after `pnpm install`, with pwsh and go-sqlcmd on PATH and a
# SQL Server on localhost:1433 whose sa password is in MSSQL_SA_PASSWORD.
set -euo pipefail

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

echo "== 1. parse dump-legacy.ps1 under pwsh"
pwsh -NoProfile -Command '
  $errors = $null
  [void][System.Management.Automation.Language.Parser]::ParseFile(
    (Resolve-Path "scripts/dump-legacy.ps1"), [ref]$null, [ref]$errors)
  if ($errors.Count -gt 0) { $errors | ForEach-Object { Write-Error $_.ToString() }; exit 1 }
  "parsed OK"'

echo "== 2. go-sqlcmd output against a real SQL Server"
pwsh -NoProfile -File scripts/ci/check-go-sqlcmd.ps1

echo "== 3. full dump against fake-sqlcmd.sh"
pwsh -NoProfile -File scripts/dump-legacy.ps1 \
  -Server fake -Database fake -Username check -Password check -GoSqlcmd \
  -SqlcmdPath "$PWD/scripts/ci/fake-sqlcmd.sh" \
  -OutDir "$work/dumps" -DerivedOutDir "$work/derived"

python3 - "$work" <<'PY'
import json, pathlib, sys
work = pathlib.Path(sys.argv[1])
manifest = json.loads((work / "dumps" / "manifest.json").read_text(encoding="utf-8"))
tables = manifest["tables"]
assert len(tables) == 17, f"expected 17 tables in manifest, got {len(tables)}"
for name, count in tables.items():
    raw = (work / "dumps" / f"{name}.csv").read_bytes()
    assert not raw.startswith(b"\xef\xbb\xbf"), f"{name}.csv has a BOM"
    lines = raw.decode("utf-8").split("\r\n")
    assert lines[-1] == "" and len(lines) == 3, f"{name}.csv: expected header + 1 CRLF row"
    assert count == 1, f"manifest says {count} rows for {name}"
    assert lines[1].startswith('"1",'), f"{name}.csv row: {lines[1]!r}"
    fields = lines[0].count('","') + 1
    if fields >= 3:
        assert ",NULL," in lines[1] + "," or lines[1].endswith(",NULL"), f"{name}.csv: no bare NULL"
    if fields >= 4:
        assert '"say ""hi"""' in lines[1], f"{name}.csv: quote not doubled"
    if fields >= 2:
        assert '"Pokagon État"' in lines[1], f"{name}.csv: non-ASCII text mangled"
derived = list((work / "derived").glob("*.csv"))
assert len(derived) >= 6, f"expected derived CSVs, got {len(derived)}"
print(f"dump output OK: {len(tables)} tables, {len(derived)} derived files")
PY

echo "== 4. loader dry-run reads the fake dump"
pnpm exec tsx scripts/migrate-data.ts --dry-run --dumps-dir "$work/dumps"
