#!/usr/bin/env sh
# Maps changed file paths to affected pnpm workspace package names.
# Reads paths from stdin (one per line) or from arguments.

set -eu

ALL=false
PACKAGES=""

add_package() {
  case " $PACKAGES " in
    *" $1 "*) ;;
    *) PACKAGES="$PACKAGES $1" ;;
  esac
}

add_shared_with_dependents() {
  add_package "@earthquake-reports/shared"
  add_package "@earthquake-reports/etl-lambda"
  add_package "@earthquake-reports/ai-lambda"
  add_package "@earthquake-reports/search-api"
}

mark_all() {
  ALL=true
}

process_file() {
  file="$1"

  case "$file" in
    apps/search-api/*)
      add_package "@earthquake-reports/search-api"
      ;;
    apps/ai-lambda/*)
      add_package "@earthquake-reports/ai-lambda"
      ;;
    apps/etl-lambda/*)
      add_package "@earthquake-reports/etl-lambda"
      ;;
    packages/eslint-config/*|packages/shared/*)
      add_shared_with_dependents
      ;;
    prettier.config.js|tsconfig.base.json|pnpm-lock.yaml|pnpm-workspace.yaml|package.json|.husky/*|scripts/affected-workspaces.sh|scripts/git-hooks/*)
      mark_all
      ;;
  esac
}

if [ "$#" -gt 0 ]; then
  for file in "$@"; do
    [ -n "$file" ] && process_file "$file"
  done
else
  while IFS= read -r file; do
    [ -n "$file" ] && process_file "$file"
  done
fi

if [ "$ALL" = true ]; then
  printf '%s\n' \
    "@earthquake-reports/shared" \
    "@earthquake-reports/etl-lambda" \
    "@earthquake-reports/ai-lambda" \
    "@earthquake-reports/search-api"
  exit 0
fi

echo "$PACKAGES" | tr ' ' '\n' | sed '/^$/d' | sort -u
