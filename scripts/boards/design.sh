#!/usr/bin/env bash
# Nyumban Design System board constants (org project #11)
# Sourced by board-*.sh — do not run directly.

export GH_OWNER="NyumbanApp"
export BOARD_KEY="design"
export BOARD_TITLE="Nyumban Design System"
export BOARD_NUMBER=11
export PROJECT_ID="PVT_kwDODh8RKc4BgALU"
export BOARD_URL="https://github.com/orgs/NyumbanApp/projects/11"

export STATUS_FIELD="PVTSSF_lADODh8RKc4BgALUzhaO92g"
export AREA_FIELD="PVTSSF_lADODh8RKc4BgALUzhaO-7Y"

export STATUS_BACKLOG="cf6be575"
export STATUS_TODO="f75ad846"
export STATUS_IN_PROGRESS="47fc9ee4"
export STATUS_IN_REVIEW="0f8d4f40"
export STATUS_QA="8b4210f7"
export STATUS_DONE="98236657"

export AREA_PLATFORM="cf7555f3"
export AREA_TOKENS="e7418393"
export AREA_DOCS="fcbe3448"
export AREA_PROCESS="7b9697d0"

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
    Platform) echo "$AREA_PLATFORM" ;;
    Tokens) echo "$AREA_TOKENS" ;;
    Docs) echo "$AREA_DOCS" ;;
    Process) echo "$AREA_PROCESS" ;;
    *) echo "Unknown area for design board: $1 (Platform|Tokens|Docs|Process)" >&2; return 1 ;;
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
    Platform) echo "area/platform" ;;
    Tokens) echo "area/tokens" ;;
    Docs) echo "area/docs" ;;
    Process) echo "area/process" ;;
    *) echo "Unknown area label for design board: $1" >&2; return 1 ;;
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
