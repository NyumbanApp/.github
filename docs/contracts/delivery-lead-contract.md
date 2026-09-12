# Delivery Lead Contract

**Applies to:** NyumbanApp engineering, all projects
**Status:** Active
**Related:** [Branch Naming Contract](./branch-naming-contract.md) · [In Progress Contract](./in-progress-contract.md) · [In Review Contract](./in-review-contract.md) · [Definition of Done Contract](./definition-of-done-contract.md)

---

## Purpose

The Delivery Lead exists so the CTO can express product intent while a single accountable person turns that intent into tracked, well-formed, assigned work across every project.

The role is a **player-coach**: the Delivery Lead still writes code. Coordination is a minority; the remainder is implementation. This role does **not** remove a developer from the delivery pool.

---

## Scope

The Delivery Lead owns delivery coordination across **all** NyumbanApp projects.

---

## Responsibilities

### 1. Ticket creation from CTO intent

The CTO expresses intent via email (or agreed channel). The Delivery Lead converts each intent into a GitHub issue:

- Title in `Type | Area | Summary` format
- Acceptance criteria from the CTO's intent copied into the issue body and refined for clarity
- Sidebar fields set: **Type**, **Priority**, **Area**, **Assignee**
- Added to the correct project board with **Status** set (Backlog or Todo)

### 2. Intake SLA

Every CTO intent becomes a GitHub issue within **24 hours**, and the issue link is sent back to the CTO. Nothing remains only in email — the GitHub issue is the source of truth.

### 3. Acceptance criteria clarity

Before assigning, the Delivery Lead ensures AC is unambiguous. If intent is unclear, the Lead pushes back to the CTO for clarification rather than passing a vague ticket to a developer.

### 4. Assignment by expertise

The Delivery Lead assigns each issue to the developer best suited by expertise, respecting the WIP limit in the [In Progress Contract](./in-progress-contract.md) (at most one sole-assignee issue In Progress per board).

### 5. Board ownership

The board reflects reality at all times. The Delivery Lead runs the weekly (~15 min) board hygiene: promote Backlog → Todo, drain QA, ensure every active card has assignee + Priority + Area, flag WIP-limit breaches, and close issues once Done.

### 6. QA coordination

- **Product-critical project tasks:** the **CTO** performs final QA sign-off. The Delivery Lead ensures work reaches QA correctly and routes fails back to In Progress.
- **Non-critical project tasks:** the Delivery Lead **coordinates QA** — performing it or delegating to the assigned developer against the AC — with CTO spot-checks.

QA acceptance rules follow the [Definition of Done Contract](./definition-of-done-contract.md).

---

## Boundaries — what the Delivery Lead does NOT do

- Does **not** own final QA sign-off for product-critical project tasks. That stays with the CTO.
- Does **not** re-prioritize work without the CTO. Priority is set by the CTO at intake.
- Does **not** replace peer review. Code review is distributed via CODEOWNERS and branch protection; the Lead reviews only as a normal code owner, not as a dedicated reviewer.
- Does **not** stop coding. This is a player-coach role, not a full-time management role.

---

## Continuity (bus factor)

The delivery process is documented so it does not depend on one person's memory. If the Delivery Lead is unavailable, weekly hygiene and intake can be run by a designated backup (default: the CTO) using this contract and each coding repo's process workflow (example: [`github-workflow.md`](https://github.com/NyumbanApp/nyumban-mobile-app-frontend/blob/main/docs/process/github-workflow.md); backend uses `docs/process/git-workflow.md`).

---

## Access

The Delivery Lead holds the platform access required to support delivery and releases (store consoles and cloud console), granted at least-privilege and recorded in the team access register. Specific credentials and scopes are not defined in this contract.

---

## In one line

The CTO defines *what* and *why*; the Delivery Lead turns it into tracked, assigned, well-formed work and owns the board — while still shipping code.
