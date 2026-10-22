#!/bin/bash
# gate-all.sh — run check_site.py over every HTML page; exit 1 on any failure
cd "$(dirname "$0")/.."
fail=0
while IFS= read -r f; do
  echo "== $f"
  python3 tools/check_site.py "$f" | tail -1 | grep -q "ALL PASS" || { echo "GATE FAILED: $f"; fail=1; }
done < <(find . -name "*.html" -not -path "./.superpowers/*" -not -path "./tools/fixtures/*" | sort)
[ "$fail" -eq 0 ] && echo "GATE-ALL: ALL PASS" || echo "GATE-ALL: FAILED"
exit $fail
