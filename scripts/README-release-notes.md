# Release notes

Org script + reusable workflow that builds a **GitHub Release** body from issues closed since the last release (Done ≈ closed after QA).

## Product vs internal

| Mode | Includes | Use |
|------|----------|-----|
| **product** (default) | Closed issues **except** Area Docs / Process | Stakeholder-facing GitHub Release |
| **internal** | All closed issues in the window | Eng/audit log (Phase B) — do not replace product Release body |

## Local

```bash
cd /path/to/NyumbanApp/.github
export GITHUB_TOKEN=$(gh auth token)

node scripts/generate-release-notes.mjs \
  --repo NyumbanApp/nyumban-mobile-app-frontend \
  --since 2026-07-01T00:00:00Z \
  --mode product
```

## From an app repo (Actions)

App repos call [`.github/workflows/generate-release-notes.yml`](../.github/workflows/generate-release-notes.yml) via a thin `release-notes.yml`:

- **Push tag `v*`** → generate product notes and create/update a GitHub Release for that tag  
- **workflow_dispatch** → dry-run: job summary + artifact only (optional `since` input)

```bash
# Cut a release (after main is ready)
git checkout main && git pull
git tag v1.2.3
git push origin v1.2.3
# → repo Releases page gets product notes
```

First release (no previous tags): use Actions → **Release notes** → Run workflow with `since` set (ISO date), or accept the default last-14-days window, then tag when ready.

## Phase B (internal)

Same generator with `--mode internal`. Prefer attaching `INTERNAL_CHANGELOG.md` as a Release asset or a separate dispatch run — do not overwrite the product Release notes. See org README.

## Tests

```bash
npm test
# or
node --test scripts/generate-release-notes.test.mjs
```
