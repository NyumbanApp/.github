# Definition of Done Contract

**Status:** Active  
**Applies to:** All NyumbanApp engineering contributors  
**Boards:** All NyumbanApp Engineering boards  

---

## Purpose

NyumbanApp needs a consistent definition of when work is genuinely complete.

This contract defines how we use the **Done** status on our GitHub project boards. It ensures that completed work has been implemented, verified, reviewed where required and is ready for its intended outcome.

Moving an issue to **Done** signals that the agreed scope has been fully delivered and no further work is expected for that issue.

---

## The rule

An issue may only be moved to **Done** when all applicable completion requirements have been satisfied.

**Merge alone is not Done.** After a PR merges, the card moves to **QA**. Moving to **Done** requires a QA pass (Lead or designated QA) **or** a documented QA skip on the issue (for example `QA skip: docs-only` for docs, process, or pure chore/config). User-facing / product work must go through QA.

At minimum:

- The agreed acceptance criteria have been completed.
- Quality Assurance (QA) has passed, **or** a documented QA skip is on the issue where skip is allowed.
- Any required Pull Request has been approved and merged where applicable.
- Required documentation has been updated where applicable.
- The completed work is ready for its intended outcome, such as publishing, release, deployment, operational use, implementation or handover.

Pipeline order: `Backlog → Todo → In Progress → In Review → QA → Done`.

On QA fail: move back to **In Progress** with an issue comment describing what failed; open a follow-up fix PR as needed. Developers do not self-move to **Done** after merge.

---

## Definition of Done

Done means the agreed work has been completed, all applicable quality checks have passed, required code has been merged where applicable and the completed work is ready for its intended outcome.

Depending on the task, this may include:

- Publishing
- Release
- Deployment
- Operational use
- Implementation
- Handover to another team
- Completion of an agreed business deliverable

---

## Completion checklist

| Requirement | Required? |
|-----------|-------------|
| Acceptance criteria completed | Yes |
| QA passed, or documented QA skip (docs/process/chore only) | Yes |
| Pull Request merged (where applicable) | Yes |
| Required documentation updated | Where applicable |
| Required approvals obtained | Where applicable |
| Ready for its intended outcome | Yes |
| Outstanding release or delivery blocking issues | No |

---

## When to move to Done

Move an issue to **Done** only when you have:

1. Completed the agreed scope of work.
2. Merged the approved Pull Request where applicable (card should be in **QA** after merge).
3. Confirmed QA passed, **or** left a documented QA skip comment where skip is allowed.
4. Updated any required documentation.
5. Obtained any required approvals.
6. Confirmed the completed work is ready for its intended outcome.

**Who moves QA → Done:** Lead (or designated QA). Do not move to **Done** simply because development finished or the PR merged. When moving to Done, **close the issue** (product PRs use `Refs #N` so merge does not auto-close).

---

## When NOT to move to Done

Do **not** move an issue to **Done** if:

- Acceptance criteria remains incomplete.
- Required QA has not been completed.
- QA has failed.
- A required Pull Request is still open.
- Required code has not been merged.
- Required approvals are outstanding.
- Critical defects remain unresolved.
- The completed work is not ready for its intended outcome.

Instead, keep the issue in the appropriate workflow stage until those requirements have been completed.

---

## Developer responsibilities

Developers should:

- Complete all agreed acceptance criteria.
- Ensure appropriate quality before requesting QA.
- Respond to review feedback promptly.
- Merge approved Pull Requests where applicable.
- Keep issue status aligned with reality (In Progress → In Review; after merge the card is in **QA**).
- Use `Refs #N` on product PRs so merge does not close the issue ([In Review Contract](./in-review-contract.md)).
- **Do not** move work to **Done** after merge — Lead/QA does that after acceptance (or after a documented QA skip).

---

## QA responsibilities

Quality Assurance should:

- Test the agreed acceptance criteria where applicable.
- Record the outcome.
- Confirm whether the issue passes or fails QA.
- Raise defects before an issue is moved to **Done**.
- Confirm that the completed work satisfies the agreed quality standard.

---

## Project lead responsibilities

Project leads should:

- Ensure the Definition of Done is consistently applied.
- Verify that required reviews and approvals have been completed.
- Return issues to the correct workflow stage if moved to **Done** prematurely.
- Periodically review completed issues for quality and consistency.

---

## Enforcement

**Phase 1 (Current):** Manual - contributors, QA and project leads apply this contract through normal project reviews.  

**Phase 2 (later, if needed):** Reporting and dashboards identify issues moved to **Done** before satisfying the required conditions.  

**Phase 3 (later, only if agreed):** GitHub automation may validate completion requirements before allowing workflow completion.  

Automation should support good engineering practice rather than replace it.

---

## Related documents

- [In Progress Contract](https://github.com/NyumbanApp/.github/blob/main/docs/contracts/in-progress-contract.md)
- [In Review Contract](https://github.com/NyumbanApp/.github/blob/main/docs/contracts/in-review-contract.md)
- [GitHub Issue Workflow](https://github.com/NyumbanApp/nyumban-mobile-app-frontend/blob/main/docs/process/github-workflow.md)
- [NyumbanApp Organisation Defaults](https://github.com/NyumbanApp/.github)
- [GitHub Projects](https://github.com/orgs/NyumbanApp/projects)

---

## Summary

| Principle | Practice |
|-----------|----------|
| Complete the agreed work | Acceptance criteria satisfied |
| Verify quality | QA pass or documented skip |
| Merge approved code | Pull Request merged where applicable (`Refs #N` keeps issue open for QA) |
| Ready for its intended outcome | Ready for publishing, release, deployment, implementation, operational use, or handover |
| Status reflects reality | Done means genuinely complete; Lead closes the issue |

