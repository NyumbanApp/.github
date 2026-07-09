# NyumbanApp — org GitHub defaults

Organization-wide **community health files** and **reusable CI** for [NyumbanApp](https://github.com/NyumbanApp).

> **Note:** This repository must remain **public** for org-wide issue and PR templates to apply.

## Contents

| File / path | Purpose |
|-------------|---------|
| [`pull_request_template.md`](./pull_request_template.md) | Auto-loads in new Pull Requests across org repos |
| [`.github/workflows/validate-pr-body.yml`](./.github/workflows/validate-pr-body.yml) | Reusable workflow — Tier 2 PR body validation |
| [`scripts/validate-pr-body.mjs`](./scripts/validate-pr-body.mjs) | Validator logic (unit-tested) |

## PR template CI (Tier 2)

Application code repos call the reusable workflow via `.github/workflows/pr-template-check.yml`.

### Rules enforced

**Structure**

- Exactly one `Closes #N` in the PR body
- Sections: `## Summary`, `## Steps to test`, `## Checklist`
- Non-empty summary
- At least one filled numbered step under Steps to test
- All **6** checklist items checked (`- [x]`)

**Issue integrity**

- Linked issue exists in the same repo and is **open**
- Issue is on [Nyumban V1 Launch](https://github.com/orgs/NyumbanApp/projects/3) (Project #3)

### Exemptions (check passes without validation)

- Draft PRs
- `dependabot[bot]` / `renovate[bot]`
- Label `skip-pr-template` (Lead only)

### Wired repos

- `nyumban-mobile-app-frontend`
- `nyumban-app-backend`
- `nyumban-admin-panel-web-app-fronted`
- `nyumban-ams-web-app-frontend`
- `nyumban-ams-web-app-backend`
- `nyumban-forum-web-app-frontend`
- `nyumban-forum-web-app-backend`
- `nyumban-landing-web-app`
- `nyumban-web-app-frontend`

### Caller workflow (per repo)

```yaml
name: PR template check
on:
  pull_request:
    types: [opened, edited, synchronize, reopened, ready_for_review]
    branches: [main]

jobs:
  validate:
    uses: NyumbanApp/.github/.github/workflows/validate-pr-body.yml@main
```

### Hard merge block (when GitHub Team is enabled)

On each application code repo → **Settings → Branches → `main`**:

1. Require a pull request before merging
2. Require status check **`PR template check`** (job name from reusable workflow)
3. Require 1 approval (recommended)
4. Disable force pushes and branch deletion

Until Team is enabled, the check shows a red X but does not block merge — Lead must not merge failing PRs.

## Process

- Every task is a **GitHub issue** on the [Nyumban V1 Launch board](https://github.com/orgs/NyumbanApp/projects/3).
- Every PR must link an issue with `Closes #N`, include **Steps to test**, and complete the checklist.
- Full workflow: [github-workflow.md](https://github.com/NyumbanApp/nyumban-mobile-app-frontend/blob/main/docs/process/github-workflow.md).

## Team announcement (WhatsApp)

> **NyumbanApp Engineering Update**
>
> PRs to `main` now run an automatic **PR template check**. Fix any red X before requesting review.
>
> Every PR must have: `Closes #N`, **Steps to test**, and all checklist items checked.
>
> Ref: https://github.com/NyumbanApp/.github

## Development

```bash
npm test   # runs scripts/validate-pr-body.test.mjs
```

## Adding more defaults

Future org-level files can live here (e.g. `ISSUE_TEMPLATE/`, `CONTRIBUTING.md`). Repo-specific overrides go in each repo's `.github/` directory.
