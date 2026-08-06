# Branch auto-delete (deferred until GitHub Team / Enterprise)

**Status:** Blocked on org upgrade from GitHub Free.  
**Do not enable** `Automatically delete head branches` while branch protection / rulesets remain unavailable.

## When Team (or Enterprise) is active

Apply to all nine product repos:

1. `nyumban-mobile-app-frontend`
2. `nyumban-app-backend`
3. `nyumban-web-app-frontend`
4. `nyumban-admin-panel-web-app-fronted`
5. `nyumban-ams-web-app-frontend`
6. `nyumban-ams-web-app-backend`
7. `nyumban-forum-web-app-frontend`
8. `nyumban-forum-web-app-backend`
9. `nyumban-landing-web-app`

### Steps

1. **Protect `main` and `staging`** (ruleset or classic branch protection):
   - Block force pushes
   - **Block deletions**
2. Enable repo setting **Automatically delete head branches** (`delete_branch_on_merge: true`), e.g.:

```bash
for r in \
  nyumban-mobile-app-frontend \
  nyumban-app-backend \
  nyumban-web-app-frontend \
  nyumban-admin-panel-web-app-fronted \
  nyumban-ams-web-app-frontend \
  nyumban-ams-web-app-backend \
  nyumban-forum-web-app-frontend \
  nyumban-forum-web-app-backend \
  nyumban-landing-web-app
do
  gh api -X PATCH "repos/NyumbanApp/$r" -f delete_branch_on_merge=true
done
```

3. Document one paragraph in [`docs/contracts/branch-naming-contract.md`](../contracts/branch-naming-contract.md).
4. Smoke-test: merge a tiny feature PR on one repo → head deleted; `main` / `staging` untouched.

No custom Actions workflow is required once protection exists.
