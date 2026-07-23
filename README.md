# NyumbanApp — org GitHub defaults

Shared defaults for all [NyumbanApp](https://github.com/NyumbanApp) repositories.

> **This repo must stay public** so org-wide PR and issue templates apply to member repos.

## What lives here

| Path | Purpose |
|------|---------|
| [`docs/contracts/in-progress-contract.md`](./docs/contracts/in-progress-contract.md) | WIP limit: one solo In Progress per dev per board |
| [`docs/contracts/definition-of-done-contract.md`](./docs/contracts/definition-of-done-contract.md) | Defines when work is complete and may move to **Done** |
| [`docs/contracts/branch-naming-contract.md`](./docs/contracts/branch-naming-contract.md) | Branch format: `type/issue#-slug` (CI enforced) |
| [`scripts/create-branch.sh`](./scripts/create-branch.sh) | Create a contract-compliant branch from an issue |
| [`scripts/board-list.sh`](./scripts/board-list.sh) | List cards on Mobile / Admin / WebApp boards |
| [`scripts/board-move-status.sh`](./scripts/board-move-status.sh) | Move an issue’s board status from the terminal |
| [`scripts/board-create-issue.sh`](./scripts/board-create-issue.sh) | Create issue + add to board + set type/priority/area |
| [`scripts/boards/`](./scripts/boards/) | Per-board project field IDs (`mobile`, `admin`, `webapp`) |
| [`scripts/README-board-scripts.md`](./scripts/README-board-scripts.md) | Board CLI setup and usage |
| [`pull_request_template.md`](./pull_request_template.md) | Default PR description for new pull requests |
| [`.github/workflows/validate-pr-body.yml`](./.github/workflows/validate-pr-body.yml) | Reusable workflow: PR template check |
| [`scripts/validate-pr-body.mjs`](./scripts/validate-pr-body.mjs) | Validation logic |

Application repos opt in with `.github/workflows/pr-template-check.yml` that checks out this validator (do not duplicate validation logic inline).

## Delivery Contracts

The following organisation-wide contracts define the engineering standards used across all NyumbanApp repositories.

- [In Progress Contract](./docs/contracts/in-progress-contract.md)
- [Definition of Done Contract](./docs/contracts/definition-of-done-contract.md)

### Board check (phased)

| Phase | Secret | Board CI |
|-------|--------|----------|
| **1 — Free, no PAT** | None | Skipped (lead confirms issue on [projects](https://github.com/orgs/NyumbanApp/projects)) |
| **2 — Free + repo secrets** | `PR_BOARD_CHECK_TOKEN` per app repo | Strict GraphQL board check |
| **3 — GitHub Team** | Org `PR_BOARD_CHECK_TOKEN` | Strict (delete per-repo copies) |

Board membership uses GraphQL `projectItems`, which requires a fine-grained PAT with **Organization → Projects: Read**. Store as repository secret `PR_BOARD_CHECK_TOKEN` on Free (org secrets do not apply to private repos on Free). Pass via workflow env `BOARD_CHECK_TOKEN`.

Linked issue existence/open state always uses `GITHUB_TOKEN` (no PAT required).

## Board CLI

Update board status without opening GitHub. Boards: `mobile` (#3), `admin` (#4), `webapp` (#5). Statuses: Backlog → Todo → In Progress → In Review → QA → Done.

```bash
git clone https://github.com/NyumbanApp/.github.git && cd .github
chmod +x scripts/board-*.sh
gh auth refresh -s project,read:org

./scripts/board-list.sh --board webapp
./scripts/board-move-status.sh --board webapp --repo NyumbanApp/nyumban-web-app-frontend --issue 12 --status "In Progress"
```

Full guide: [`scripts/README-board-scripts.md`](./scripts/README-board-scripts.md).

## Project board workflows (manual, once per board)

On projects **#3 / #4 / #5** → **Project settings → Workflows**:

1. **Pull request merged** → set Status to **QA** (not Done).
2. **Item closed** → leave disabled / do not auto-set Done (so close does not race past QA).

Built-in Project workflow targets are not editable via API; configure them in the GitHub UI.

## Development

```bash
npm test
```
