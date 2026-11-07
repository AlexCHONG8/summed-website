#!/bin/bash
# Impeccable design detector — 62 UI anti-pattern / quality rules.
# Pure code: no model, no API key, no quota. Run after UI edits.
# Requires Node 18.19+ (npx). Advisories are reported but never fail the run.
# Usage: bash tools/design-check.sh [detect options] [files|dirs|urls...]
set -e
cd "$(dirname "$0")/.."
if [ "$#" -eq 0 ]; then
  set -- .
fi
exec npx -y impeccable@4.8.0 detect "$@"
