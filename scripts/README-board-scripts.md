# Board CLI scripts

Org-wide helpers for NyumbanApp GitHub Project boards. **Source of truth** — do not copy into app repos.

## Boards

| `--board` | Project | URL |
|-----------|---------|-----|
| `mobile` | Nyumban Mobile App (#3) | https://github.com/orgs/NyumbanApp/projects/3 |
| `admin` | Nyumban Admin Panel (#4) | https://github.com/orgs/NyumbanApp/projects/4 |
| `webapp` | Nyumban WebApp (#5) | https://github.com/orgs/NyumbanApp/projects/5 |

**Statuses:** `Backlog`, `Todo`, `In Progress`, `In Review`, `Done`  
QA is not supported until that column ships on the boards.

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
| [`board-move-status.sh`](./board-move-status.sh) | Move an issue’s card by status |
| [`board-create-issue.sh`](./board-create-issue.sh) | Create issue + type/priority/area + add to board |
| [`boards/`](./boards/) | Per-board IDs (sourced — do not run directly) |

These scripts do **not** enforce the [In Progress](../docs/contracts/in-progress-contract.md) or [Definition of Done](../docs/contracts/definition-of-done-contract.md) contracts — follow those manually.

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
