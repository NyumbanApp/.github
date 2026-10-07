# QA pass / fail comment template

Copy into the **GitHub issue** comment when work is in **QA**. Test against the acceptance criteria on the issue. Role title **QA** only.

## Reminders

- Test the **AC** — if it is not on the issue, it is out of scope or a new ticket.
- **FAIL** needs evidence (screenshot or short recording). Paste images into the comment.
- **PASS** can stay short.
- Do **not** close the issue or move to **Done** — Delivery Lead (or CTO for product-critical) does that after pass.
- Unclear AC → comment and ping the Delivery Lead; do not invent scope.

Related: [Definition of Done](../contracts/definition-of-done-contract.md) · [Delivery Lead](../contracts/delivery-lead-contract.md)

---

## FAIL

```text
## QA: FAIL
Issue: #N
AC failed:
- [ ] <paste the AC checkbox / line>

Steps:
1. …
2. …

Expected: …
Actual: …

Evidence: <screenshot(s) pasted below> (optional)
```

---

## PASS

```text
## QA: PASS
Issue: #N
Checked AC: all listed on the issue
Env: …
Notes: none / minor non-blocking: …
→ Delivery Lead: ready to close
```
