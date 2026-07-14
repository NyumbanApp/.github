# Branch Naming Contract

**Status:** Active (enforced in CI)  
**Applies to:** All NyumbanApp engineering contributors

---

## Purpose

Consistent branch names link code to issues, improve traceability, and enable automation.

---

## The rule

**Format:** `<type>/<issue#>-<kebab-slug>`

- **type:** `feature`, `bug`, or `task` (matches issue Type)
- **issue#:** GitHub issue number for this work
- **slug:** short kebab-case summary from the issue title

Examples:

- `bug/168-commercial-unit-floor-area`
- `feature/53-android-push-banner`
- `task/91-prisma-migrate-ecs`

---

## How to create a branch

Use the org script (requires `gh`, `git`, and `jq`):

```bash
git clone https://github.com/NyumbanApp/.github.git
cd .github
./scripts/create-branch.sh --issue 168 --repo nyumban-mobile-app-frontend
```

From an existing app repo clone (when `gh` knows the current repo):

```bash
/path/to/.github/scripts/create-branch.sh --issue 168
```

The script reads the issue title, derives type + slug, updates `main`, and creates the branch.

---

## Developer responsibilities

- Create branches with the script or the exact contract format
- Ensure branch issue number matches `Closes #N` in the PR
- Record branch name on the issue (issue template field)
- Base branch: `main`

---

## Enforcement

**Day one:** PR template CI rejects PRs whose head branch fails the naming regex or whose issue number disagrees with `Closes #N`.

Skipped (same as PR template check): draft PRs, Dependabot/Renovate, `skip-pr-template` label.

---

## Related documents

- [In Progress Contract](./in-progress-contract.md)
- [GitHub issue workflow (mobile)](https://github.com/NyumbanApp/nyumban-mobile-app-frontend/blob/main/docs/process/github-workflow.md)
- [`create-branch.sh`](../../scripts/create-branch.sh)

---

## Summary

| Principle | Practice |
|-----------|----------|
| `type/issue#-slug` | Traceable, enforceable branch names |
| Script-first | No manual issue-number lookup |
| CI enforcement | Invalid branches cannot merge |
