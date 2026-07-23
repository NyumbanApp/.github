#!/usr/bin/env bash
# Nyumban WebApp board constants (org project #5)
# Sourced by board-*.sh — do not run directly.

export GH_OWNER="NyumbanApp"
export BOARD_KEY="webapp"
export BOARD_TITLE="Nyumban WebApp"
export BOARD_NUMBER=5
export PROJECT_ID="PVT_kwDODh8RKc4BbtQj"
export BOARD_URL="https://github.com/orgs/NyumbanApp/projects/5"

export STATUS_FIELD="PVTSSF_lADODh8RKc4BbtQjzhWb5uQ"
export AREA_FIELD="PVTSSF_lADODh8RKc4BbtQjzhWb5xA"

export STATUS_BACKLOG="2abb95c1"
export STATUS_TODO="b21da1c9"
export STATUS_IN_PROGRESS="d3a50ab7"
export STATUS_IN_REVIEW="3923f74a"
export STATUS_QA="226b89a0"
export STATUS_DONE="d55ff87d"

export AREA_WEB_FRONTEND="5dffe7ea"
export AREA_BACKEND="b0242a34"
export AREA_DOCS="43c0f05c"
export AREA_PROCESS="9c1b37ac"

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
    qa) echo "$STATUS_QA" ;;
    done) echo "$STATUS_DONE" ;;
    *)
      echo "Unknown status: $1 (Backlog|Todo|In Progress|In Review|QA|Done)" >&2
      return 1
      ;;
  esac
}

area_option_id() {
  case "$1" in
    "Web Frontend") echo "$AREA_WEB_FRONTEND" ;;
    Backend) echo "$AREA_BACKEND" ;;
    Docs) echo "$AREA_DOCS" ;;
    Process) echo "$AREA_PROCESS" ;;
    *) echo "Unknown area for webapp board: $1 (Web Frontend|Backend|Docs|Process)" >&2; return 1 ;;
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

normalize_priority() {
  case "$(echo "$1" | tr '[:upper:]' '[:lower:]')" in
    low) echo "Low" ;;
    medium) echo "Medium" ;;
    high) echo "High" ;;
    urgent) echo "Urgent" ;;
    *)
      echo "Unknown priority: $1 (Low|Medium|High|Urgent)" >&2
      return 1
      ;;
  esac
}

type_label_for() {
  case "$(echo "$1" | tr '[:upper:]' '[:lower:]')" in
    bug) echo "type/bug" ;;
    feature) echo "type/feature" ;;
    task) echo "type/task" ;;
    *) return 1 ;;
  esac
}

area_label_for() {
  case "$1" in
    "Web Frontend") echo "area/web-frontend" ;;
    Backend) echo "area/backend" ;;
    Docs) echo "area/docs" ;;
    Process) echo "area/process" ;;
    *) echo "Unknown area label for webapp board: $1" >&2; return 1 ;;
  esac
}

priority_label_for() {
  case "$(normalize_priority "$1")" in
    Urgent) echo "priority/P0-critical" ;;
    High) echo "priority/P1-high" ;;
    Medium) echo "priority/P2-medium" ;;
    Low) echo "priority/P3-low" ;;
    *) return 1 ;;
  esac
}

repo_short_name() {
  local r="$1"
  r="${r#NyumbanApp/}"
  echo "$r"
}
