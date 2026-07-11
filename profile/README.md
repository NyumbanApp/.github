# NyumbanApp

**Property management for Africa** — connecting tenants, landlords, and agents through day-to-day property operations.

NyumbanApp is built by [NyumbanApp Smart Solutions (NSS)](https://github.com/NyumbanApp). We ship mobile-first experiences web-apps and backed by a shared API and a consistent **Screen → Controller → Service** architecture across apps.

## What we build

| Surface | Focus |
|--------|--------|
| **Mobile** | iOS & Android app for tenants and landlords — search, applications, rent, agreements, notifications |
| **Web** | Consumer web app (Vite + React) on the same API as mobile |
| **Admin** | Internal operations — verifications, dashboards, platform management |
| **Landing** | Public marketing and onboarding entry point |
| **Forum** | Public discussions regarding day-to-day property operations  |

Shared backend: Node.js, Express, Prisma, PostgreSQL — deployed on **AWS** (EC2, RDS, S3).

## Product scope

- Property discovery, applications, and landlord workflows  
- Rent payments, deposits, and manual payment recording  
- Tenant & landlord profiles, company accounts, and role-based access  
- Verification, agreements, and compliance-oriented flows  

> NyumbanApp is the **African** product in our ecosystem. Sister products (global marketplace, payments) are developed under separate identities — see our blueprint docs internally.

## Open source & standards

This organization uses shared GitHub defaults in our public [`.github`](https://github.com/NyumbanApp/.github) repo:

- PR templates and validation  
- Issue → branch → PR (`Closes #N`) → review → merge  
- Project board tracking for delivery  
- Delivery contracts (WIP limits, etc.) in [`docs/contracts/`](https://github.com/NyumbanApp/.github/tree/main/docs/contracts)  

Application repositories are private. Contributors should follow the workflow documented in each repo’s `docs/process/github-workflow.md`.

## Contact

For access, partnerships, or contributor onboarding, contact the NSS project lead at it@nyumbanapp.com.

---

*© NyumbanApp Smart Solutions. All rights reserved.*
