# GMHerbal — Project Notes (Saved Progress)

Date: 2026-01-06

## What’s implemented

### Storefront
- Modern responsive header (desktop + mobile).
- Shop page: unified product grid, search + tags UI, improved cart UX (header cart icon + per-product quantity badges).
- Buy/checkout flow improvements and responsive cart rows.
- Legal pages + footer links.
- Branding: rotating background logo effect using `public/logo (4).png` (direction reversed per request).
- WhatsApp:
  - Floating WhatsApp button exists.
  - Added floating WhatsApp button specifically on `/shop`.

### Admin
- Admin pages split:
  - `/admin` = home dashboard (Products/Orders panels removed as requested).
  - `/admin/products` = products management.
  - `/admin/orders` = orders management.
- Orders:
  - NEW orders sorted to top.
  - Navbar badge showing NEW order count (polling).
  - Filter tags including partner orders.

### Partner
- Partner self-signup and partner-managed API keys.
- Partner dashboard (overview, orders, API keys, bank details).

## Big change: Product taxonomy (enums → database options)

Problem:
- While adding a product, category/oil type/variant/extraction were limited by hardcoded enums.

Solution:
- Replaced hardcoded enums with database-backed option tables:
  - `ProductCategoryOption`
  - `OilTypeOption`
  - `ProductVariantOption`
  - `ExtractionMethodOption`
- `Product` stores nullable foreign keys:
  - `categoryId`, `oilTypeId`, `variantId`, `extractionId`
- Admin can add new options without code changes via:
  - API: `/api/admin/product-options?kind=category|oilType|variant|extraction`
  - UI: options are loaded dynamically in Products admin.
- Backward compatibility:
  - APIs still return string `code` values for category/oilType/variant/extraction so most UI stays stable.

Migration:
- Migration added: `prisma/migrations/20260105123000_product_options/migration.sql`

## How to run (local)

1) Install deps:
- `npm install`

2) Configure DB:
- Create MySQL DB (example: `gmherbal`).
- Set `DATABASE_URL` in `.env`.

3) Apply migrations + seed:
- `npm run db:generate`
- `npx prisma migrate dev`
- `npm run db:seed`

4) Start:
- `npm run dev`

## Environment variables you must set

Required:
- `DATABASE_URL`

Admin:
- `ADMIN_PASSWORD` (admin login password)
- `ADMIN_SESSION_SECRET` (cookie signing; rotate to force logout)

Partner:
- `PARTNER_SESSION_SECRET` (partner cookie signing)

API key reveal:
- `API_KEY_ENCRYPTION_SECRET` (keep stable; rotating may make old encrypted keys unrevealable)

## Production: change admin password
- Update env var `ADMIN_PASSWORD` on your host.
- Restart/redeploy.
- Optional: rotate `ADMIN_SESSION_SECRET` to invalidate all admin sessions immediately.

## Known gotchas

### Windows Prisma EPERM (file lock)
Sometimes `prisma generate` fails with:
- `EPERM: operation not permitted, rename ... query_engine-windows.dll.node`

Fix:
- Stop any running `npm run dev` / Node processes, then rerun:
  - `npm run db:generate`

## Git / history
- Repo: https://github.com/level-top/gmherbal
- Work is committed and pushed.

## Next ideas (optional)
- Make shop filter tags fully dynamic from DB options (currently tags are curated; new categories won’t automatically appear as tags unless we change that UX).
