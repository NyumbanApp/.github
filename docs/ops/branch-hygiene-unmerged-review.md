# Unmerged branch review (2026-08-06)

Merged-safe branches were deleted in Phase 1. The branches below still have commits not in `main` and have **no open PR**.

**Do not delete** until the surface owner confirms. Default if no reply: **keep**.

Always kept: `main`, `staging`.

| Repo | Owner | Unmerged (no open PR) | Open PR heads (kept) |
|------|-------|----------------------:|---------------------:|
| `nyumban-admin-panel-web-app-fronted` | Amos | 19 | 2 |
| `nyumban-ams-web-app-backend` | Amos / AMS | 0 | 0 |
| `nyumban-ams-web-app-frontend` | Amos / AMS | 0 | 0 |
| `nyumban-app-backend` | Sofa / surface owners | 40 | 13 |
| `nyumban-forum-web-app-backend` | D-Souz | 3 | 0 |
| `nyumban-forum-web-app-frontend` | D-Souz | 1 | 1 |
| `nyumban-landing-web-app` | opiobonniky | 2 | 1 |
| `nyumban-mobile-app-frontend` | Sofa | 46 | 4 |
| `nyumban-web-app-frontend` | Sofa | 5 | 3 |

**Totals:** 116 unmerged for review · 24 open PR heads kept.

## Per-owner detail

### Amos

#### `nyumban-admin-panel-web-app-fronted`

Confirm delete:
- [ ] `bug/124-fix-property-details-map-back-navigation`
- [ ] `feat/accounts-wire-platform-detail`
- [ ] `feat/admin-announcements-send-screen-amos`
- [ ] `feat/agreements-detail-screen-amos`
- [ ] `feat/agreements-preview-ui-amos`
- [ ] `feat/verifications-grade-a-ui-amos`
- [ ] `feature/122-professional-mapbox-propertylocationmapv`
- [ ] `fix/invite-modal-inline-validation`
- [ ] `task/admin-board-metadata-hygiene-amos`
- [ ] `task/companies-list-detail-amos`
- [ ] `task/remove-rent-payments-status-filter-amos`
- [ ] `task/wire-dashboard-companies-metrics-amos`
- [ ] `task/69-fix-companies-api-path`
- [ ] `task/113-fix-accounts-platform-user-info-cards-vi`
- [ ] `task/117-remove-read-only-info-card-from-user-det`
- [ ] `task/127-add-branded-404-page`
- [ ] `task/130-show-recipient-name-instead-of-raw-uuid`
- [ ] `task/134-remove-admin-create-promotion-for-v1`
- [ ] `task/140-verification-admin-guidance-card`

Open PR (keep):
- `chore/configurable-dev-api-proxy`
- `docs/admin-agreement-terminate-cancel-assignments`

### Amos / AMS

#### `nyumban-ams-web-app-backend`

_No unmerged branches awaiting review._

#### `nyumban-ams-web-app-frontend`

_No unmerged branches awaiting review._

### D-Souz

#### `nyumban-forum-web-app-backend`

Confirm delete:
- [ ] `development`
- [ ] `fix-forum-reply-user-has-liked`
- [ ] `fix-forum-user-anormalization`

#### `nyumban-forum-web-app-frontend`

Confirm delete:
- [ ] `fix/forum-reply-likes-user-has-liked`

Open PR (keep):
- `probation/contestant2`

### Sofa

#### `nyumban-mobile-app-frontend`

Confirm delete:
- [ ] `chore/remove-support-contact-fields`
- [ ] `docs/investigation-add-property-save-button-disabled`
- [ ] `docs/investigation-bottomsheet-menu-flash-android`
- [ ] `docs/investigation-current-address-checkbox-ios-nobert`
- [ ] `docs/investigation-offline-storage-v1-scope-nobert`
- [ ] `docs/network-report-nobert`
- [ ] `feat/company-settings-list-item-andama`
- [ ] `feat/existing-tenancy-onboarding-register-bonny`
- [ ] `feat/landlord-market-visibility-banner-nobert`
- [ ] `feat/next-button-nobert`
- [ ] `feat/product-analytics-sdk-bonny`
- [ ] `feat/property-gallery-max-15-images-nobert`
- [ ] `feat/q-search-tour-application-lists-amos`
- [ ] `feat/unverified-property-warning-application-request-amos`
- [ ] `feat/unverified-property-warning-tour-request-bonny`
- [ ] `feat-accepted-tour-rent-property-cta-bonny`
- [ ] `feat-feature-flags-bonny`
- [ ] `feature/flutterwave-sandbox-verification-payment-amos`
- [ ] `feature/move-property-status-refining`
- [ ] `feature/push-notifications`
- [ ] `feature/unit-status-change-bug`
- [ ] `feature/109-property-detail-gallery-pinch-zoom`
- [ ] `fix/add-property-thumbnail-upload-progress-nobert`
- [ ] `fix/amos-agreement-termination-navigation-ux`
- [ ] `fix/amos-company-termination-authorization`
- [ ] `fix/application-requests-details-navigation-and-list-freshness-amos`
- [ ] `fix/axios-no-auto-retry-post-patch`
- [ ] `fix/cold-start-double-signin-incomplete-signup-nobert`
- [ ] `fix/commercial-hide-open-house-landlord-details-nobert`
- [ ] `fix/commercial-unit-details-ui-nobert`
- [ ] `fix/dashboard-analytics-modal-android-scroll-nobert`
- [ ] `fix/hide-contact-until-application-approved-amos`
- [ ] `fix/hide-contact-until-tour-accepted-bonny`
- [ ] `fix/ios-cold-start-navigation-hang-nobert`
- [ ] `fix/list-screen-network-ux-andama`
- [ ] `fix/list-screen-network-ux-nobert`
- [ ] `fix/navigation-follow-user-movement-nobert`
- [ ] `fix/otp-clear-on-verify-error`
- [ ] `fix/payment-idempotency-mobile-amos`
- [ ] `fix/property-feed-contact-email-phone-routing-nobert`
- [ ] `fix/property-feed-media-section-android-share-overflow-nobert`
- [ ] `fix/property-feed-share-bottom-sheet-nobert`
- [ ] `fix/property-navigation-location-permission-nobert`
- [ ] `fix/property-navigation-reliability-nobert`
- [ ] `fix/tour-requests-details-navigation-and-list-freshness-bonny`
- [ ] `task/227-verification-what-to-include-copy`

Open PR (keep):
- `bug/148-route-navigation-movement-on-take-me-there`
- `feat/tenant-agreement-preview-accept-footer-amos`
- `fix/add-property-units-error-card`
- `security/tls-certificate-pinning`

#### `nyumban-web-app-frontend`

Confirm delete:
- [ ] `chore/remove-support-contact-fields`
- [ ] `feature/188-add-property-phase-6-media`
- [ ] `task/1-scaffold-vite-app-shell-api-client`
- [ ] `task/76-remove-support-contact-fields`
- [ ] `task/272-account-profile`

Open PR (keep):
- `feature/297-use-content-disposition-pdf-filenames`
- `task/141-recover-account-screen`
- `task/294-tenant-agreements-list-screen`

### Sofa / surface owners

#### `nyumban-app-backend`

Confirm delete:
- [ ] `agreement-testing-checks-bonny`
- [ ] `deployment`
- [ ] `docs/amos-flutterwave-sandbox-verification-payment`
- [ ] `docs/investigate-safe-record-deletion-plan-amos`
- [ ] `feat/admin-announcements-broadcast-amos`
- [ ] `feat/agreements-preview-api-amos`
- [ ] `feat/auth-block-gate`
- [ ] `feat/bootstrap-v2-a-fix-session-recovery`
- [ ] `feat/existing-tenancy-onboarding-backfill-amos`
- [ ] `feat/hard-delete-property-unit-v1`
- [ ] `feat/health-endpoint`
- [ ] `feat/landlord-market-visibility-banner-nobert`
- [ ] `feat/q-search-tour-application-lists-amos`
- [ ] `feat/s3-cdn-urls`
- [ ] `feature/backend-anonymization-kinyera-amos`
- [ ] `feature/commercial-property-integrations-lead`
- [ ] `feature/delete-users-account-backend-amos`
- [ ] `feature/flutterwave-sandbox-verification-payment-amos`
- [ ] `feature/landlord-intial-manual-payment-flow-finding-amos`
- [ ] `feature/manual-rent-payment-backend-integration-amos`
- [ ] `feature/294-expand-company-staff-rbac`
- [ ] `feaure/manual-registration-tenant-backend-amos`
- [ ] `fix/admin-properties-remove-status`
- [ ] `fix/admin-safe-profile-update-me`
- [ ] `fix/agreement-notification-copy`
- [ ] `fix/detached-listing-display-v1`
- [ ] `fix/pdf-download-networkidle-timeout`
- [ ] `fix/push-notification-get-by-id`
- [ ] `fix/233-block-invite-during-company-delete-window`
- [ ] `legal/update-agreement-templates-magama-review-amos`
- [ ] `phase-2c-money-system-finalization`
- [ ] `refactor/admin-accounts-readonly`
- [ ] `refactor/admin-properties-defer-suspend`
- [ ] `revert/pdf-download-timeout-fix-135`
- [ ] `task/admin-companies-api-bigmosi`
- [ ] `task/dashboard-companies-stats-bigmosi`
- [ ] `task/254-stop-returning-legacy-tenant-profile-sta`
- [ ] `task/257-add-is-onboarding-complete-to-platform-u`
- [ ] `task/267-remove-admin-create-promotion-routes-for`
- [ ] `task/271-verification-request-events`

Open PR (keep):
- `dependabot/npm_and_yarn/dotenv-17.3.1`
- `dependabot/npm_and_yarn/eslint/js-10.0.1`
- `dependabot/npm_and_yarn/ioredis-5.10.1`
- `dependabot/npm_and_yarn/multer-2.1.1`
- `dependabot/npm_and_yarn/prisma/client-7.6.0`
- `feat/existing-tenancy-onboarding-registe-bonny`
- `feat/tour-list-search-q-backend`
- `feat-feature-flags-bonny`
- `feature/agreement-management-landlord-integration`
- `feature/agreement-management-tenant-integration`
- `feature/290-searchable-pdf-download-filenames`
- `fix/admin-delete-rate-limit-shared-middleware`
- `fix/pdf-puppeteer-ecs-chromium`

### opiobonniky

#### `nyumban-landing-web-app`

Confirm delete:
- [ ] `deployment-testing-andama`
- [ ] `task/39-remove-newsletter-backend`

Open PR (keep):
- `feature/58-nav-get-started-cta`

