# NyumbanApp — org GitHub defaults

This repository holds **organization-wide default community health files** for [NyumbanApp](https://github.com/NyumbanApp).

Repos in the org that do not define their own template will inherit these defaults.

> **Note:** This repository must remain **public** for org-wide issue and PR templates to apply. Other community health files can use a public or internal `.github` repo; PR/issue templates specifically require public.

## Contents

| File | Purpose |
|------|---------|
| [`pull_request_template.md`](./pull_request_template.md) | Auto-loads in new Pull Requests across org repos |

## Process

- Every task is a **GitHub issue** on the [Nyumban V1 Launch board](https://github.com/orgs/NyumbanApp/projects/3).
- Every PR must link an issue with `Closes #N`, include **Steps to test**, and complete the checklist.
- Full workflow: [github-workflow.md](https://github.com/NyumbanApp/nyumban-mobile-app-frontend/blob/main/docs/process/github-workflow.md) (mobile repo).

## Adding more defaults

Future org-level files can live here (e.g. `ISSUE_TEMPLATE/`, `CONTRIBUTING.md`). Repo-specific overrides go in each repo's `.github/` directory.
