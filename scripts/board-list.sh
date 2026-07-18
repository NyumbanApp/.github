#!/usr/bin/env bash
# List cards on a NyumbanApp engineering board (optionally filter by status).
#
# Usage:
#   ./scripts/board-list.sh --board webapp
#   ./scripts/board-list.sh --board mobile --status Todo
#
# Boards: mobile | admin | webapp
# Status: Backlog | Todo | In Progress | In Review | Done
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

BOARD=""
FILTER_STATUS=""

usage() {
  sed -n '2,10p' "$0"
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --board) BOARD="$2"; shift 2 ;;
    --status) FILTER_STATUS="$2"; shift 2 ;;
    -h|--help) usage ;;
    *) echo "Unknown arg: $1" >&2; usage ;;
  esac
done

[[ -n "$BOARD" ]] || {
  echo "Missing --board" >&2
  usage
}

case "$BOARD" in
  mobile|admin|webapp) ;;
  *) echo "Unknown --board: $BOARD (mobile|admin|webapp)" >&2; exit 1 ;;
esac

# shellcheck source=/dev/null
source "$SCRIPT_DIR/boards/${BOARD}.sh"

if [[ -n "$FILTER_STATUS" ]]; then
  status_option_id "$FILTER_STATUS" >/dev/null
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "Error: gh CLI is required" >&2
  exit 1
fi
if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required" >&2
  exit 1
fi

gh project item-list "$BOARD_NUMBER" --owner "$GH_OWNER" --limit 100 --format json \
| jq -r --arg s "$FILTER_STATUS" '
  .items[]
  | select($s == "" or .status == $s)
  | "\(.status // "?")\t\(.area // "?")\t\((.assignees // []) | join(",") // "?")\t#\(.content.number // "?")\t\(.content.title // .title)"
' | column -t -s $'\t'

echo ""
echo "Board: $BOARD_URL"
