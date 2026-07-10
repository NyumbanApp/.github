# NyumbanApp — org GitHub defaults

Shared defaults for all [NyumbanApp](https://github.com/NyumbanApp) repositories.

> **This repo must stay public** so org-wide PR and issue templates apply to member repos.

## What lives here

| Path | Purpose |
|------|---------|
| [`pull_request_template.md`](./pull_request_template.md) | Default PR description for new pull requests |
| [`.github/workflows/validate-pr-body.yml`](./.github/workflows/validate-pr-body.yml) | Reusable workflow: PR template check |
| [`scripts/validate-pr-body.mjs`](./scripts/validate-pr-body.mjs) | Validation logic |

Application repos opt in with `.github/workflows/pr-template-check.yml` calling the reusable workflow above (do not duplicate the validator inline).

Board membership uses GraphQL `projectItems`, which requires a fine-grained PAT with **Organization → Projects: Read**. Store it as org secret `PR_BOARD_CHECK_TOKEN` and pass `BOARD_CHECK_TOKEN` to the validator (falls back to `GITHUB_TOKEN` when unset).

## Workflow

Issue → branch → PR (`Closes #N`) → review → merge. Details: [github-workflow.md](https://github.com/NyumbanApp/nyumban-mobile-app-frontend/blob/main/docs/process/github-workflow.md).

## Development

```bash
npm test
```
