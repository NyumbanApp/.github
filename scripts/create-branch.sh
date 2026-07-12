#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Create a branch that follows the NyumbanApp Branch Naming Contract.

Usage:
  create-branch.sh --issue <number> [--repo <owner/name>] [--dry-run]

Options:
  --issue N       GitHub issue number (required)
  --repo NAME     Repository (default: current gh repo)
  --dry-run       Print branch name only; do not checkout

Examples:
  ./scripts/create-branch.sh --issue 168 --repo NyumbanApp/nyumban-mobile-app-frontend
  ./scripts/create-branch.sh --issue 53
EOF
}

ISSUE_NUMBER=""
REPO=""
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --issue)
      ISSUE_NUMBER="${2:-}"
      shift 2
      ;;
    --repo)
      REPO="${2:-}"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ -z "$ISSUE_NUMBER" ]]; then
  echo "Error: --issue is required" >&2
  usage >&2
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "Error: gh CLI is required" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required" >&2
  exit 1
fi

if [[ -z "$REPO" ]]; then
  REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)"
fi

if [[ -z "$REPO" ]]; then
  echo "Error: could not detect repo; pass --repo owner/name" >&2
  exit 1
fi

ISSUE_JSON="$(gh issue view "$ISSUE_NUMBER" --repo "$REPO" --json number,title 2>/dev/null || true)"
if [[ -z "$ISSUE_JSON" ]]; then
  echo "Error: issue #$ISSUE_NUMBER not found in $REPO" >&2
  exit 1
fi

TITLE="$(jq -r '.title' <<<"$ISSUE_JSON")"
ISSUE_NUM="$(jq -r '.number' <<<"$ISSUE_JSON")"

slugify() {
  echo "$1" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g; s/-{2,}/-/g' \
    | cut -c1-40 \
    | sed -E 's/-+$//'
}

TYPE_RAW="$(echo "$TITLE" | cut -d'|' -f1 | xargs)"
SUMMARY="$(echo "$TITLE" | cut -d'|' -f3- | xargs)"

case "$(echo "$TYPE_RAW" | tr '[:upper:]' '[:lower:]')" in
  feature) TYPE_PREFIX="feature" ;;
  bug) TYPE_PREFIX="bug" ;;
  task) TYPE_PREFIX="task" ;;
  *)
    echo "Error: issue title must start with Feature |, Bug |, or Task | (got: $TITLE)" >&2
    exit 1
    ;;
esac

if [[ -z "$SUMMARY" ]]; then
  echo "Error: issue title must use Type | Area | Summary format (got: $TITLE)" >&2
  exit 1
fi

SLUG="$(slugify "$SUMMARY")"
if [[ -z "$SLUG" ]]; then
  echo "Error: could not derive slug from issue title" >&2
  exit 1
fi

BRANCH_NAME="${TYPE_PREFIX}/${ISSUE_NUM}-${SLUG}"

if $DRY_RUN; then
  echo "$BRANCH_NAME"
  exit 0
fi

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Error: run from a git clone of $REPO (or set cwd to that repo)" >&2
  exit 1
fi

CURRENT_REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)"
if [[ "$CURRENT_REPO" != "$REPO" ]]; then
  echo "Error: current repo is ${CURRENT_REPO:-unknown}; expected $REPO" >&2
  echo "Run this script from the app repo clone, or use --dry-run and create the branch manually." >&2
  exit 1
fi

git fetch origin main
git checkout main
git pull --ff-only origin main
git checkout -b "$BRANCH_NAME"

echo "Created branch: $BRANCH_NAME"
