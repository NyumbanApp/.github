#!/usr/bin/env bash
# Nyumban Admin Panel board constants (org project #4)
# Sourced by board-*.sh — do not run directly.

export GH_OWNER="NyumbanApp"
export BOARD_KEY="admin"
export BOARD_TITLE="Nyumban Admin Panel"
export BOARD_NUMBER=4
export PROJECT_ID="PVT_kwDODh8RKc4BbPqs"
export BOARD_URL="https://github.com/orgs/NyumbanApp/projects/4"

export STATUS_FIELD="PVTSSF_lADODh8RKc4BbPqszhWBip0"
export AREA_FIELD="PVTSSF_lADODh8RKc4BbPqszhWBjB8"

export STATUS_BACKLOG="414ee781"
export STATUS_TODO="a091a3e0"
export STATUS_IN_PROGRESS="98d774fc"
export STATUS_IN_REVIEW="34c4fd2f"
export STATUS_DONE="a4412a92"

export AREA_ADMIN_FRONTEND="19ddde0c"
export AREA_ADMIN_BACKEND="fde099e4"
export AREA_DOCS="e9b4cad2"
export AREA_PROCESS="a6f274ef"

export PRIORITY_FIELD_ID=37006962
export TYPE_BUG="IT_kwDODh8RKc4Bvrrv"
export TYPE_FEATURE="IT_kwDODh8RKc4Bvrrw"
export TYPE_TASK="IT_kwDODh8RKc4Bvrru"

status_option_id() {
  case "$(echo "$1" | tr '[:upper:]' '[:lower:]')" in
    backlog) echo "$STATUS_BACKLOG" ;;
    todo) echo "$STATUS_TODO" ;;
    "in progress"|in-progress) echo "$STATUS_IN_PROGRESS" ;;
    "in review"|in-review) echo "$STATUS_IN_REVIEW" ;;
    done) echo "$STATUS_DONE" ;;
    qa)
      echo "Status QA is not configured yet (column not on boards). Use: Backlog|Todo|In Progress|In Review|Done" >&2
      return 1
      ;;
    *)
      echo "Unknown status: $1 (Backlog|Todo|In Progress|In Review|Done)" >&2
      return 1
      ;;
  esac
}

area_option_id() {
  case "$1" in
    "Admin Frontend") echo "$AREA_ADMIN_FRONTEND" ;;
    "Admin Backend") echo "$AREA_ADMIN_BACKEND" ;;
    Docs) echo "$AREA_DOCS" ;;
    Process) echo "$AREA_PROCESS" ;;
    *) echo "Unknown area for admin board: $1 (Admin Frontend|Admin Backend|Docs|Process)" >&2; return 1 ;;
  esac
}

type_id_for() {
  case "$(echo "$1" | tr '[:upper:]' '[:lower:]')" in
    bug) echo "$TYPE_BUG" ;;
    feature) echo "$TYPE_FEATURE" ;;
    task) echo "$TYPE_TASK" ;;
    *) echo "Unknown type: $1 (bug|feature|task)" >&2; return 1 ;;
  esac
}

repo_short_name() {
  local r="$1"
  r="${r#NyumbanApp/}"
  echo "$r"
}
