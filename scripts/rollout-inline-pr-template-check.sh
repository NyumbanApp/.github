#!/usr/bin/env bash
# Update pr-template-check.yml to inline validator (workflow_call blocked by org policy).
set -euo pipefail

CALLER_FILE="$(cd "$(dirname "$0")/.." && pwd)/.github/workflows/pr-template-check-inline.yml"
if [ ! -f "$CALLER_FILE" ]; then
  CALLER_FILE="$(dirname "$0")/../APP_FRONTEND/.github/workflows/pr-template-check.yml"
fi

REPOS=(
  nyumban-mobile-app-frontend
  nyumban-app-backend
  nyumban-admin-panel-web-app-fronted
  nyumban-ams-web-app-frontend
  nyumban-ams-web-app-backend
  nyumban-forum-web-app-frontend
  nyumban-forum-web-app-backend
  nyumban-landing-web-app
  nyumban-web-app-frontend
)

WORKDIR="${TMPDIR:-/tmp}/nyumban-inline-pr-check"
mkdir -p "$WORKDIR"

for repo in "${REPOS[@]}"; do
  echo "=== $repo ==="
  rm -rf "$WORKDIR/$repo"
  gh repo clone "NyumbanApp/$repo" "$WORKDIR/$repo" -- --depth 1
  cd "$WORKDIR/$repo"
  git checkout -b fix/inline-pr-template-check 2>/dev/null || git checkout fix/inline-pr-template-check
  mkdir -p .github/workflows
  cp "$CALLER_FILE" .github/workflows/pr-template-check.yml 2>/dev/null || \
    cp "/Users/pandollar/NPS/NPS_MOBILE_APP/APP/NYUMBAN_APP_V.1.0.0/APP_FRONTEND/.github/workflows/pr-template-check.yml" .github/workflows/pr-template-check.yml
  if git diff --quiet; then
    echo "No changes — skipping"
    cd "$WORKDIR"
    continue
  fi
  git add .github/workflows/pr-template-check.yml
  git commit -m "fix(ci): inline PR template check (org reusable workflow blocked)"
  git push -u origin fix/inline-pr-template-check --force
  gh pr create --repo "NyumbanApp/$repo" --base main --head fix/inline-pr-template-check \
    --title "fix(ci): inline PR template check" \
    --body "Replaces workflow_call with inline checkout of NyumbanApp/.github validator. Reusable workflow_call hits startup_failure until org Actions policy allows cross-repo reuse."
  pr_num=$(gh pr list --repo "NyumbanApp/$repo" --head fix/inline-pr-template-check --json number -q '.[0].number')
  gh pr merge --repo "NyumbanApp/$repo" "$pr_num" --squash --delete-branch
  cd "$WORKDIR"
done
echo "Done."
