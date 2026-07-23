#!/usr/bin/env bash
# Move an issue's card on a NyumbanApp engineering board.
#
# Usage:
#   ./scripts/board-move-status.sh --board webapp --issue 12 --status "In Progress"
#   ./scripts/board-move-status.sh --board mobile --repo NyumbanApp/nyumban-mobile-app-frontend \
#     --issue 183 --status "In Review"
#
# Boards: mobile | admin | webapp
# Status: Backlog | Todo | In Progress | In Review | QA | Done
#
# Does not enforce In Progress WIP or Definition of Done — follow those contracts manually.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

BOARD=""
REPO=""
ISSUE_NUM=""
STATUS=""

usage() {
  sed -n '2,14p' "$0"
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --board) BOARD="$2"; shift 2 ;;
    --repo) REPO="$2"; shift 2 ;;
    --issue) ISSUE_NUM="$2"; shift 2 ;;
    --status) STATUS="$2"; shift 2 ;;
    -h|--help) usage ;;
    *) echo "Unknown arg: $1" >&2; usage ;;
  esac
done

[[ -n "$BOARD" && -n "$ISSUE_NUM" && -n "$STATUS" ]] || {
  echo "Missing --board, --issue, or --status" >&2
  usage
}

case "$BOARD" in
  mobile|admin|webapp) ;;
  *) echo "Unknown --board: $BOARD (mobile|admin|webapp)" >&2; exit 1 ;;
esac

# shellcheck source=/dev/null
source "$SCRIPT_DIR/boards/${BOARD}.sh"

if [[ -z "$REPO" ]]; then
  REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)"
fi
if [[ -z "$REPO" ]]; then
  echo "Error: could not detect repo; pass --repo owner/name" >&2
  exit 1
fi
# Allow short repo name
if [[ "$REPO" != */* ]]; then
  REPO="NyumbanApp/$REPO"
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "Error: gh CLI is required" >&2
  exit 1
fi

REPO_SHORT="$(repo_short_name "$REPO")"
STATUS_ID="$(status_option_id "$STATUS")"

item_id=$(gh api graphql -f query="
  query { repository(owner: \"NyumbanApp\", name: \"$REPO_SHORT\") {
    issue(number: $ISSUE_NUM) {
      projectItems(first: 20) {
        nodes { id project { title } }
      }
    }
  }}" --jq ".data.repository.issue.projectItems.nodes[] | select(.project.title==\"$BOARD_TITLE\") | .id")

if [[ -z "$item_id" ]]; then
  echo "Issue #$ISSUE_NUM not on $BOARD_TITLE. Adding..." >&2
  gh project item-add "$BOARD_NUMBER" --owner "$GH_OWNER" \
    --url "https://github.com/$REPO/issues/$ISSUE_NUM" --format json --jq .id >/dev/null
  item_id=$(gh api graphql -f query="
    query { repository(owner: \"NyumbanApp\", name: \"$REPO_SHORT\") {
      issue(number: $ISSUE_NUM) {
        projectItems(first: 20) {
          nodes { id project { title } }
        }
      }
    }}" --jq ".data.repository.issue.projectItems.nodes[] | select(.project.title==\"$BOARD_TITLE\") | .id")
fi

if [[ -z "$item_id" ]]; then
  echo "Error: could not find or add issue #$ISSUE_NUM on $BOARD_TITLE" >&2
  exit 1
fi

gh project item-edit --id "$item_id" --project-id "$PROJECT_ID" \
  --field-id "$STATUS_FIELD" --single-select-option-id "$STATUS_ID"

echo "Issue #$ISSUE_NUM → $STATUS on $BOARD_TITLE"
echo "$BOARD_URL"
