#!/usr/bin/env bash
# Roll out pr-template-check.yml caller to application code repos.
# Requires: gh auth with `workflow` scope (gh auth refresh -h github.com -s workflow)

set -euo pipefail

CALLER_CONTENT='name: PR template check

on:
  pull_request:
    types: [opened, edited, synchronize, reopened, ready_for_review]
    branches: [main]

jobs:
  validate:
    uses: NyumbanApp/.github/.github/workflows/validate-pr-body.yml@main
    with:
      pr_body: ${{ github.event.pull_request.body || '' }}
      pr_draft: ${{ github.event.pull_request.draft }}
      pr_author: ${{ github.event.pull_request.user.login }}
      pr_labels_json: ${{ toJSON(github.event.pull_request.labels) }}
'

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

WORKDIR="${TMPDIR:-/tmp}/nyumban-pr-template-rollout"
mkdir -p "$WORKDIR"

for repo in "${REPOS[@]}"; do
  echo "=== $repo ==="
  existing=""
  if existing=$(gh api "repos/NyumbanApp/$repo/contents/.github/workflows/pr-template-check.yml" --jq .content 2>/dev/null | base64 -d); then
    if echo "$existing" | grep -q 'uses: NyumbanApp/.github/.github/workflows/validate-pr-body.yml@main'; then
      echo "Already using org reusable workflow — skipping"
      continue
    fi
    echo "Inline workflow found — will replace with org caller"
  fi
  rm -rf "$WORKDIR/$repo"
  gh repo clone "NyumbanApp/$repo" "$WORKDIR/$repo" -- --depth 1
  cd "$WORKDIR/$repo"
  git checkout -b chore/org-pr-template-caller
  mkdir -p .github/workflows
  printf '%s' "$CALLER_CONTENT" > .github/workflows/pr-template-check.yml
  git add .github/workflows/pr-template-check.yml
  git commit -m "ci: use org reusable PR template check workflow"
  git push -u origin chore/org-pr-template-caller
  gh pr create --repo "NyumbanApp/$repo" --base main --head chore/org-pr-template-caller \
    --title "ci: use org reusable PR template check workflow" \
    --body "Replaces inline pr-template-check with NyumbanApp/.github reusable workflow caller."
  pr_num=$(gh pr list --repo "NyumbanApp/$repo" --head chore/org-pr-template-caller --json number -q '.[0].number')
  gh pr merge --repo "NyumbanApp/$repo" "$pr_num" --squash --delete-branch
  cd "$WORKDIR"
done

echo "Done."
