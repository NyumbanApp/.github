# In Review Contract

**Status:** Active  
**Applies to:** All NyumbanApp engineering contributors  
**Boards:** All NyumbanApp Engineering boards

---

## Purpose

NyumbanApp separates **code review** from **acceptance QA**.

This contract defines how we use the **In Review** status on our GitHub project boards. In Review means a pull request is open and ready for (or receiving) peer review. It is **not** the same as QA: QA verifies acceptance criteria after merge.

Pipeline: `Backlog → Todo → In Progress → In Review → QA → Done`.

---

## The rule

An issue may be in **In Review** only when:

1. There is an **open** pull request linked to that issue, and
2. The PR Linked issue section uses exactly one of: `Refs #N` (preferred for product work), `Related to #N`, or `Closes #N` (docs/process/chore with QA skip only), and
3. The board status matches reality (no In Review without an open PR; no lingering In Progress after a ready PR is open).

**In Review is code review + CI readiness.** Product acceptance belongs in **QA** after merge ([Definition of Done](./definition-of-done-contract.md)).

---

## Linking the issue (important)

| Work type | PR keyword | Issue on merge |
|-----------|------------|----------------|
| Product / user-facing | `Refs #N` or `Related to #N` | Stays **open** → card moves to **QA** |
| Docs / process / pure chore with documented QA skip | `Closes #N` allowed | May auto-close (skip QA with issue comment) |

Do **not** use `Closes #N` on product PRs. Auto-close skips the QA stage.

---

## When to move to In Review

Move an issue to **In Review** when you:

1. Have opened a non-draft pull request (or marked a draft **Ready for review**), and
2. Have filled the PR template (summary, steps to test, checklist), and
3. Have linked the board issue with `Refs #N` (or allowed alternative above), and
4. Believe the change is ready for someone else to review.

Keep the issue in **In Progress** while the PR is still a draft or not ready for reviewers.

---

## What reviewers check

Reviewers (another developer when possible; lead is fine while the team is small) should check:

- Scope matches the issue — no drive-by refactors
- Acceptance criteria on the issue are addressed in the change
- PR **Steps to test** are clear enough to exercise the change
- CI is green (or an explained, acceptable skip)
- No secrets or credentials committed
- Branch name matches the [Branch Naming Contract](./branch-naming-contract.md) and the linked issue number

Reviewers do **not** need to complete full product / acceptance QA. That happens in **QA** after merge.

---

## When to merge

Merge only when:

1. Required CI checks are green (or an agreed exception is documented on the PR), and
2. Review feedback is addressed (approve or explicit lead override), and
3. The PR still links exactly one board issue.

After merge for product work: the card moves to **QA**; the issue stays **open**. Developers do **not** close the issue or move it to **Done**.

---

## After merge (hand-off to QA)

| Outcome | Action |
|---------|--------|
| QA pass | Lead/QA moves to **Done** and **closes** the issue |
| QA fail | Move to **In Progress**, comment what failed, open a fix PR (`Refs #N` again) |
| Docs/chore with `Closes #N` + QA skip comment | May already be closed; confirm Done hygiene |

---

## Developer responsibilities

- Move to **In Review** when the PR is ready for reviewers (not while still drafting)
- Use `Refs #N` for product work so merge does not close the issue
- Respond to review comments promptly
- Keep board status honest
- After merge, leave the issue for QA — do not self-close product issues

---

## Reviewer responsibilities

- Review within a reasonable time (prefer same day when possible for launch work)
- Leave actionable feedback on the PR
- Approve when the change is safe to merge; request changes when it is not
- Do not treat review approval as Definition of Done

---

## Project lead responsibilities

- Ensure In Review cards have an open linked PR
- Cover review when no peer is available
- After merge, ensure cards land in **QA** and are not left Done/closed early
- Weekly hygiene: scan In Review and QA columns

---

## Enforcement

**Phase 1 (current):** Manual — PR template defaults to `Refs #`; CI accepts `Refs` / `Related to` / `Closes` (exactly one). Lead and peers apply this contract in review.

**Phase 2 (later, if needed):** Branch protection — require status checks and at least one approving review before merge.

**Phase 3 (later, only if agreed):** Stronger CI (e.g. reject `Closes #` on product PRs without an explicit QA-skip signal).

---

## Related documents

- [In Progress Contract](./in-progress-contract.md)
- [Definition of Done Contract](./definition-of-done-contract.md)
- [Branch Naming Contract](./branch-naming-contract.md)
- [GitHub issue workflow](https://github.com/NyumbanApp/nyumban-mobile-app-frontend/blob/main/docs/process/github-workflow.md)
- [NyumbanApp org defaults](https://github.com/NyumbanApp/.github)

---

## Summary

| Principle | Practice |
|-----------|----------|
| In Review ≠ QA | Review is pre-merge; acceptance is post-merge |
| Link without auto-close | Product PRs use `Refs #N` |
| Status matches reality | Open ready PR ↔ In Review |
| Lead closes after QA | Done means verified, not merely merged |
| Manual first | Required reviews / hard Closes bans come later |
