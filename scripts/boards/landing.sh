#!/usr/bin/env bash
# Nyumban Landing Web App board constants (org project #10)
# Sourced by board-*.sh — do not run directly.

export GH_OWNER="NyumbanApp"
export BOARD_KEY="landing"
export BOARD_TITLE="Nyumban Landing Web App"
export BOARD_NUMBER=10
export PROJECT_ID="PVT_kwDODh8RKc4Bexf8"
export BOARD_URL="https://github.com/orgs/NyumbanApp/projects/10"

export STATUS_FIELD="PVTSSF_lADODh8RKc4Bexf8zhZJOTI"
export AREA_FIELD="PVTSSF_lADODh8RKc4Bexf8zhZJO28"

export STATUS_BACKLOG="c5f5fd16"
export STATUS_TODO="f75ad846"
export STATUS_IN_PROGRESS="47fc9ee4"
export STATUS_IN_REVIEW="abbdc9f9"
export STATUS_QA="bec236af"
export STATUS_DONE="98236657"

export AREA_LANDING_FRONTEND="e0812a98"
export AREA_DOCS="b9d9aecc"
export AREA_PROCESS="26fdaeb1"

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
    "Landing Frontend") echo "$AREA_LANDING_FRONTEND" ;;
    Docs) echo "$AREA_DOCS" ;;
    Process) echo "$AREA_PROCESS" ;;
    *) echo "Unknown area for landing board: $1 (Landing Frontend|Docs|Process)" >&2; return 1 ;;
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
    "Landing Frontend") echo "area/landing-frontend" ;;
    Docs) echo "area/docs" ;;
    Process) echo "area/process" ;;
    *) echo "Unknown area label for landing board: $1" >&2; return 1 ;;
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
