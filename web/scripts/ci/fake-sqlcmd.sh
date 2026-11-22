#!/usr/bin/env bash
# Stand-in for sqlcmd, used only by CI's dump-script check to run
# dump-legacy.ps1 end to end on Linux without a database.
#
# It checks that the script passes the flags the real dump depends on, then
# writes one result row per query to the -o file: "0" for the embedded-newline
# pre-flight counts, otherwise one row with as many fields as the query has
# ISNULL(..., N'NULL') columns, joined by the -s separator. The values cover
# the CSV writer's cases: the NULL token, a doubled quote and non-ASCII text.
set -euo pipefail

in="" out="" sep="" seen=" "
while [ $# -gt 0 ]; do
  case "$1" in
    -i) in="$2"; shift 2 ;;
    -o) out="$2"; shift 2 ;;
    -s) sep="$2"; shift 2 ;;
    -S|-d|-U|-P|-f|-h) seen+="$1=$2 "; shift 2 ;;
    *) seen+="$1 "; shift ;;
  esac
done

for want in "-b " "-W " "-N " "-C " "-h=-1 " "-f=65001 " "-U=" "-P="; do
  case "$seen" in
    *" $want"*) ;;
    *) echo "fake-sqlcmd: expected flag '$want' not passed (got:$seen)" >&2; exit 2 ;;
  esac
done
if [ "$sep" != $'\x1f' ]; then
  echo "fake-sqlcmd: expected the unit separator as -s" >&2; exit 2
fi
[ -f "$in" ] || { echo "fake-sqlcmd: no -i file" >&2; exit 2; }
[ -n "$out" ] || { echo "fake-sqlcmd: no -o file" >&2; exit 2; }

if grep -q "CHAR(13)" "$in"; then
  printf '0\n' > "$out"
  exit 0
fi

n=$(grep -c "N'NULL')" "$in" || true)
if [ "$n" -lt 1 ]; then
  echo "fake-sqlcmd: query has no ISNULL(..., N'NULL') columns" >&2; exit 2
fi
row="1"
for ((k = 2; k <= n; k++)); do
  case $((k % 3)) in
    0) row+="${sep}NULL" ;;
    1) row+="${sep}say \"hi\"" ;;
    2) row+="${sep}Pokagon État" ;;
  esac
done
printf '%s\n' "$row" > "$out"
