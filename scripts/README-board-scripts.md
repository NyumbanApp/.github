# Board CLI scripts

Org-wide helpers for NyumbanApp GitHub Project boards. **Source of truth** — do not copy into app repos.

## Boards

| `--board` | Project | URL |
|-----------|---------|-----|
| `mobile` | Nyumban Mobile App (#3) | https://github.com/orgs/NyumbanApp/projects/3 |
| `admin` | Nyumban Admin Panel (#4) | https://github.com/orgs/NyumbanApp/projects/4 |
| `webapp` | Nyumban WebApp (#5) | https://github.com/orgs/NyumbanApp/projects/5 |

**Statuses:** `Backlog`, `Todo`, `In Progress`, `In Review`, `QA`, `Done`

## Setup

```bash
git clone https://github.com/NyumbanApp/.github.git
cd .github
chmod +x scripts/board-*.sh
gh auth login
gh auth refresh -s project,read:org
```

## Scripts

| Script | Purpose |
|--------|---------|
| [`board-list.sh`](./board-list.sh) | Print board cards (optional `--status` filter) |
| [`board-move-status.sh`](./board-move-status.sh) | Move an issue’s board status from the terminal |
| [`board-create-issue.sh`](./board-create-issue.sh) | Create issue + type/priority/area + labels + add to board |
| [`boards/`](./boards/) | Per-board IDs (sourced — do not run directly) |

These scripts do **not** enforce the [In Progress](https://github.com/NyumbanApp/.github/blob/main/docs/contracts/in-progress-contract.md) or [Definition of Done](https://github.com/NyumbanApp/.github/blob/main/docs/contracts/definition-of-done-contract.md) contracts — follow those manually.

## `board-create-issue.sh` — required flags

| Flag | Required | Values |
|------|----------|--------|
| `--board` | Yes | `mobile` \| `admin` \| `webapp` |
| `--type` | Yes | `Bug` \| `Feature` \| `Task` |
| `--area` | Yes | See per-board areas below |
| `--priority` | Yes | `Low` \| `Medium` \| `High` \| `Urgent` |
| `--assignee` | Yes | GitHub handle |
| `--title` | Yes | Prefer `Type \| Area \| Summary` |
| `--repo` | No | `owner/name` (default: current `gh` repo) |
| `--status` | No | Default `Backlog` |
| `--body` / `--body-file` | No | Default short context stub |

### Areas by board

| Board | `--area` values |
|-------|-----------------|
| `mobile` | `Mobile`, `Backend`, `AWS`, `Docs`, `Process` |
| `admin` | `Admin Frontend`, `Admin Backend`, `Docs`, `Process` |
| `webapp` | `Web Frontend`, `Backend`, `Docs`, `Process` |

### Labels (automatic)

The script applies labels after create (creates them on the repo if missing):

- Type → `type/bug` \| `type/feature` \| `type/task` (if type cannot be mapped → **`enhancement`**)
- Area → `area/…` (kebab, board-specific)
- Priority → `priority/P0-critical` \| `P1-high` \| `P2-medium` \| `P3-low`

Do not hand-manage competing `type/*` / `area/*` / `priority/*` labels — use the CLI.

## Examples

```bash
./scripts/board-list.sh --board webapp
./scripts/board-list.sh --board mobile --status Todo

./scripts/board-move-status.sh --board webapp \
  --repo NyumbanApp/nyumban-web-app-frontend \
  --issue 12 --status "In Progress"

./scripts/board-create-issue.sh --board admin \
  --repo NyumbanApp/nyumban-admin-panel-web-app-fronted \
  --type Task --area "Admin Frontend" --priority Medium --status Todo \
  --assignee HANDLE \
  --title "Task | Admin Frontend | Summary" \
  --body "Short context."
```

`--repo` is optional when `gh` can detect the current repository.
