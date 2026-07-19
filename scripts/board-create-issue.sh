#!/usr/bin/env bash
# Create a GitHub issue and add it to a NyumbanApp engineering board.
#
# Usage:
#   ./scripts/board-create-issue.sh \
#     --board webapp \
#     --repo NyumbanApp/nyumban-web-app-frontend \
#     --type Task \
#     --area "Web Frontend" \
#     --priority Medium \
#     --status Todo \
#     --assignee HANDLE \
#     --title "Task | Web Frontend | Summary" \
#     --body "Short context."
#
# Required: --board --type --area --priority --assignee --title
# Boards: mobile | admin | webapp
# Status default: Backlog
# Labels: auto-applied from type/area/priority (type miss → enhancement)
# Does not enforce In Progress WIP or Definition of Done — follow those contracts manually.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

BOARD=""
REPO=""
ISSUE_TYPE=""
AREA=""
PRIORITY=""
STATUS="Backlog"
ASSIGNEE=""
TITLE=""
BODY=""
BODY_FILE=""

usage() {
  sed -n '2,20p' "$0"
  exit 1
}

ensure_label() {
  local repo="$1"
  local name="$2"
  local color="${3:-ededed}"
  gh label create "$name" --repo "$repo" --color "$color" --force >/dev/null 2>&1 || true
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --board) BOARD="$2"; shift 2 ;;
    --repo) REPO="$2"; shift 2 ;;
    --type) ISSUE_TYPE="$2"; shift 2 ;;
    --area) AREA="$2"; shift 2 ;;
    --priority) PRIORITY="$2"; shift 2 ;;
    --status) STATUS="$2"; shift 2 ;;
    --assignee) ASSIGNEE="$2"; shift 2 ;;
    --title) TITLE="$2"; shift 2 ;;
    --body) BODY="$2"; shift 2 ;;
    --body-file) BODY_FILE="$2"; shift 2 ;;
    -h|--help) usage ;;
    *) echo "Unknown arg: $1" >&2; usage ;;
  esac
done

[[ -n "$BOARD" && -n "$ISSUE_TYPE" && -n "$AREA" && -n "$PRIORITY" && -n "$TITLE" && -n "$ASSIGNEE" ]] || {
  echo "Missing required flag(s). Need: --board --type --area --priority --assignee --title" >&2
  usage
}

case "$BOARD" in
  mobile|admin|webapp) ;;
  *) echo "Unknown --board: $BOARD (mobile|admin|webapp)" >&2; exit 1 ;;
esac

# shellcheck source=/dev/null
source "$SCRIPT_DIR/boards/${BOARD}.sh"

PRIORITY="$(normalize_priority "$PRIORITY")"
TYPE_ID="$(type_id_for "$ISSUE_TYPE")"
AREA_ID="$(area_option_id "$AREA")"
STATUS_ID="$(status_option_id "$STATUS")"
AREA_LABEL="$(area_label_for "$AREA")"
PRIORITY_LABEL="$(priority_label_for "$PRIORITY")"

TYPE_LABEL=""
if TYPE_LABEL="$(type_label_for "$ISSUE_TYPE")"; then
  :
else
  TYPE_LABEL="enhancement"
fi

if [[ -z "$REPO" ]]; then
  REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)"
fi
if [[ -z "$REPO" ]]; then
  echo "Error: could not detect repo; pass --repo owner/name" >&2
  exit 1
fi
if [[ "$REPO" != */* ]]; then
  REPO="NyumbanApp/$REPO"
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "Error: gh CLI is required" >&2
  exit 1
fi

if [[ -n "$BODY_FILE" ]]; then
  BODY="$(cat "$BODY_FILE")"
fi
[[ -n "$BODY" ]] || BODY="## Context

(TBD)"

ISSUE_URL=$(gh issue create --repo "$REPO" --title "$TITLE" --body "$BODY" --assignee "$ASSIGNEE")
ISSUE_NUM="${ISSUE_URL##*/}"
echo "Created: $ISSUE_URL"

REPO_SHORT="$(repo_short_name "$REPO")"
issue_node_id=$(gh api graphql -f query="
  query { repository(owner: \"NyumbanApp\", name: \"$REPO_SHORT\") {
    issue(number: $ISSUE_NUM) { id }
  }}" --jq '.data.repository.issue.id')

gh api graphql -f query="
  mutation {
    updateIssue(input: { id: \"$issue_node_id\", issueTypeId: \"$TYPE_ID\" }) {
      issue { number issueType { name } }
    }
  }" >/dev/null

gh api -X PUT "repos/$REPO/issues/$ISSUE_NUM/issue-field-values" \
  --input - <<EOF
{
  "issue_field_values": [
    { "field_id": $PRIORITY_FIELD_ID, "value": "$PRIORITY" }
  ]
}
EOF

# Ensure tracking labels exist, then apply
ensure_label "$REPO" "$TYPE_LABEL" "0e8a16"
ensure_label "$REPO" "$AREA_LABEL" "1d76db"
ensure_label "$REPO" "$PRIORITY_LABEL" "d93f0b"
if [[ "$TYPE_LABEL" != "enhancement" ]]; then
  ensure_label "$REPO" "enhancement" "a2eeef"
fi

gh issue edit "$ISSUE_NUM" --repo "$REPO" \
  --add-label "${TYPE_LABEL},${AREA_LABEL},${PRIORITY_LABEL}"

gh project item-add "$BOARD_NUMBER" --owner "$GH_OWNER" --url "$ISSUE_URL" --format json --jq .id >/dev/null

item_id=$(gh api graphql -f query="
  query { repository(owner: \"NyumbanApp\", name: \"$REPO_SHORT\") {
    issue(number: $ISSUE_NUM) {
      projectItems(first: 10) {
        nodes { id project { title } }
      }
    }
  }}" --jq ".data.repository.issue.projectItems.nodes[] | select(.project.title==\"$BOARD_TITLE\") | .id")

gh project item-edit --id "$item_id" --project-id "$PROJECT_ID" \
  --field-id "$STATUS_FIELD" --single-select-option-id "$STATUS_ID"
gh project item-edit --id "$item_id" --project-id "$PROJECT_ID" \
  --field-id "$AREA_FIELD" --single-select-option-id "$AREA_ID"

echo "Board: $BOARD_URL"
echo "Issue #$ISSUE_NUM | Type: $ISSUE_TYPE | Status: $STATUS | Area: $AREA | Priority: $PRIORITY | Assignee: $ASSIGNEE"
echo "Labels: $TYPE_LABEL, $AREA_LABEL, $PRIORITY_LABEL"
