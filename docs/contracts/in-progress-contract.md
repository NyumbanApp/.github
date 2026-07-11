# In Progress Contract

**Status:** Active  
**Applies to:** All NyumbanApp engineering contributors  
**Boards:** All NyumbanApp Engineering boards

---

## Purpose

NyumbanApp needs predictable delivery and enough discipline that work stays visible, owned, and finishable.

This contract defines how we use the **In Progress** status on our GitHub project boards. It supports the wider workflow: one issue per task, one board as source of truth, one pull request as proof of implementation.

---

## The rule

**Per board:** Each developer may have **at most one** issue in **In Progress** where they are an assignee **and** the issue has **exactly one assignee** (a *sole-assignee* issue).

| Situation | Allowed? |
|-----------|----------|
| First sole-assignee issue moved to In Progress on a board | Yes |
| Second sole-assignee issue In Progress on the **same** board | No — finish or park the current one first |
| Sole-assignee In Progress on Board A **and** sole-assignee In Progress on Board B | Yes — limits are **per board** |
| Issue with **2+ assignees** (collaborative work) | Exempt — does **not** count toward anyone's WIP limit |

---

## When to move to In Progress

Move an issue to **In Progress** only when you:

1. Have read the full issue (requirements, acceptance criteria, QA notes)
2. Are the assignee (or a co-assignee on a collaborative issue)
3. Have opened a branch from `main` and intend to implement now

Do **not** move issues to In Progress to "reserve" work you will start later.

---

## Before starting another sole-assignee task

If you already have one sole-assignee issue In Progress on a board, you must do one of the following before starting another sole-assignee issue on that board:

- Open a pull request and move the current issue to **In Review**, or
- Move the current issue back to **Todo** and leave an issue comment explaining why (blocked, reprioritized, etc.)

---

## Collaborative issues (multi-assignee)

Issues with **two or more assignees** are excluded from the WIP limit. They may remain In Progress without blocking assignees from other work.

**This exemption is for genuine pair or team work** — not for avoiding the limit. The project lead may return an issue to a single assignee if multi-assignee is misused.

---

## Developer responsibilities

- Keep board status honest: In Progress means you are actively implementing
- Link pull requests with `Closes #N` and move to **In Review** when the PR is open
- Raise blockers as **issue comments**, not WhatsApp threads
- Check your WIP before moving a new sole-assignee issue to In Progress

---

## Project lead responsibilities

- Review boards weekly for assignees with **2+ sole-assignee** issues In Progress on the same board
- Remind developers to align status with reality (e.g. In Review without an open PR)
- Approve rare exceptions to the WIP limit; document the reason on the issue
- Close the loop: merge → verify acceptance → **Done** → close issue

---

## Enforcement

**Phase 1 (current):** Manual — developers self-enforce; lead reviews during weekly hygiene (~15 min).

**Phase 2 (later, if needed):** Report-only automation (daily summary of violations).

**Phase 3 (later, only if agreed):** Soft gates via GitHub Actions.

We introduce automation only after the team has practiced this contract manually and we have measured whether violations persist.

---

## Related documents

- [GitHub issue workflow](https://github.com/NyumbanApp/nyumban-mobile-app-frontend/blob/main/docs/process/github-workflow.md) — full delivery pipeline
- [NyumbanApp org defaults](https://github.com/NyumbanApp/.github) — PR templates and validation
- [GitHub Projects](https://github.com/orgs/NyumbanApp/projects) — all boards

---

## Summary

| Principle | Practice |
|-----------|----------|
| One sole-assignee task In Progress per board | Focus and predictable delivery |
| Collaborative issues exempt | Pair work without artificial blocking |
| Per-board limits | Parallel work across Mobile, Admin, and WebApp |
| Manual first, automate later | Continuous improvement without unnecessary friction |
