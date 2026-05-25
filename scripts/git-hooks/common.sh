#!/usr/bin/env sh

load_shell_env() {
  command -v pnpm >/dev/null 2>&1 || {
    export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
    [ -f "$HOME/.zshrc" ] && . "$HOME/.zshrc" 2>/dev/null
    [ -f "$HOME/.bashrc" ] && . "$HOME/.bashrc" 2>/dev/null
  }
}

repo_root() {
  git rev-parse --show-toplevel
}

lint_package() {
  pkg="$1"
  pnpm --filter "$pkg" run --if-present lint:fix || pnpm --filter "$pkg" run lint
}

run_lint_for_packages() {
  packages="$1"

  if echo "$packages" | grep -q '@earthquake-reports/shared'; then
    lint_package "@earthquake-reports/shared"
  fi

  for pkg in $(echo "$packages" | grep -v '@earthquake-reports/shared' || true); do
    lint_package "$pkg"
  done
}

run_push_for_packages() {
  packages="$1"

  if echo "$packages" | grep -q '@earthquake-reports/shared'; then
    pnpm --filter @earthquake-reports/shared run --if-present build
  fi

  for pkg in $(echo "$packages" | grep -v '@earthquake-reports/shared' || true); do
    pnpm --filter "$pkg" run --if-present build
  done
}
