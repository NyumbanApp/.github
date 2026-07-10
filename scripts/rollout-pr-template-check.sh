#!/usr/bin/env bash
# Roll out pr-template-check.yml caller to application code repos.
# Requires: gh auth with `workflow` scope (gh auth refresh -h github.com -s workflow)

set -euo pipefail

CALLER_CONTENT='name: PR template check

on:
  pull_request:
    types: [opened, edited, synchronize, reopened, ready_for_review]
    branches: [main]

permissions:
  pull-requests: read
  issues: read
  contents: read

jobs:
  validate:
    name: PR template check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout org validator
        uses: actions/checkout@v4
        with:
          repository: NyumbanApp/.github
          path: org-github

      - name: Run PR body validator
        env:
          PR_BODY: ${{ github.event.pull_request.body || '' }}
          PR_DRAFT: ${{ github.event.pull_request.draft && 'true' || 'false' }}
          PR_AUTHOR: ${{ github.event.pull_request.user.login }}
          PR_LABELS: ${{ toJSON(github.event.pull_request.labels) }}
          REPO: ${{ github.repository }}
          PROJECT_NUMBER: '3'
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          BOARD_CHECK_TOKEN: ${{ secrets.PR_BOARD_CHECK_TOKEN }}
        run: node org-github/scripts/validate-pr-body.mjs
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
    if echo "$existing" | grep -q 'node org-github/scripts/validate-pr-body.mjs'; then
      echo "Already using org inline validator caller — skipping"
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
