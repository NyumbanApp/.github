#!/usr/bin/env bash
# Nyumban Mobile App board constants (org project #3)
# Sourced by board-*.sh — do not run directly.

export GH_OWNER="NyumbanApp"
export BOARD_KEY="mobile"
export BOARD_TITLE="Nyumban Mobile App"
export BOARD_NUMBER=3
export PROJECT_ID="PVT_kwDODh8RKc4Ba49S"
export BOARD_URL="https://github.com/orgs/NyumbanApp/projects/3"

export STATUS_FIELD="PVTSSF_lADODh8RKc4Ba49SzhVtTaY"
export AREA_FIELD="PVTSSF_lADODh8RKc4Ba49SzhVtTfE"

export STATUS_BACKLOG="1887eddb"
export STATUS_TODO="f75ad846"
export STATUS_IN_PROGRESS="47fc9ee4"
export STATUS_IN_REVIEW="b1c1f4c4"
export STATUS_DONE="98236657"

export AREA_MOBILE="3b34bd6d"
export AREA_BACKEND="f54fd47e"
export AREA_AWS="2e755ed3"
export AREA_PROCESS="90d93960"
export AREA_DOCS="5933d213"

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
    Mobile) echo "$AREA_MOBILE" ;;
    Backend) echo "$AREA_BACKEND" ;;
    AWS) echo "$AREA_AWS" ;;
    Process) echo "$AREA_PROCESS" ;;
    Docs) echo "$AREA_DOCS" ;;
    *) echo "Unknown area for mobile board: $1 (Mobile|Backend|AWS|Process|Docs)" >&2; return 1 ;;
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
    Mobile) echo "area/mobile" ;;
    Backend) echo "area/backend" ;;
    AWS) echo "area/aws" ;;
    Process) echo "area/process" ;;
    Docs) echo "area/docs" ;;
    *) echo "Unknown area label for mobile board: $1" >&2; return 1 ;;
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
