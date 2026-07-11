# NyumbanApp — org GitHub defaults

Shared defaults for all [NyumbanApp](https://github.com/NyumbanApp) repositories.

> **This repo must stay public** so org-wide PR and issue templates apply to member repos.

## What lives here

| Path | Purpose |
|------|---------|
| [`pull_request_template.md`](./pull_request_template.md) | Default PR description for new pull requests |
| [`.github/workflows/validate-pr-body.yml`](./.github/workflows/validate-pr-body.yml) | Reusable workflow: PR template check |
| [`scripts/validate-pr-body.mjs`](./scripts/validate-pr-body.mjs) | Validation logic |

Application repos opt in with `.github/workflows/pr-template-check.yml` that checks out this validator (do not duplicate validation logic inline).

### Board check (phased)

| Phase | Secret | Board CI |
|-------|--------|----------|
| **1 — Free, no PAT** | None | Skipped (lead confirms issue on [projects](https://github.com/orgs/NyumbanApp/projects)) |
| **2 — Free + repo secrets** | `PR_BOARD_CHECK_TOKEN` per app repo | Strict GraphQL board check |
| **3 — GitHub Team** | Org `PR_BOARD_CHECK_TOKEN` | Strict (delete per-repo copies) |

Board membership uses GraphQL `projectItems`, which requires a fine-grained PAT with **Organization → Projects: Read**. Store as repository secret `PR_BOARD_CHECK_TOKEN` on Free (org secrets do not apply to private repos on Free). Pass via workflow env `BOARD_CHECK_TOKEN`.

Linked issue existence/open state always uses `GITHUB_TOKEN` (no PAT required).

## Workflow

Issue → branch → PR (`Closes #N`) → review → merge. Details: [github-workflow.md](https://github.com/NyumbanApp/nyumban-mobile-app-frontend/blob/main/docs/process/github-workflow.md).

## Development

```bash
npm test
```
