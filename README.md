# gmherbal

Next.js (App Router) landing page for gmherbal, with:
- Client landing page: products + expandable descriptions + WhatsApp contact button
- Buy form (name, father name, address, contact #1, contact #2)
- Partner (dropshipping) page + API route protected by API key
- Admin page to manage products and partners

## Run (dev)
```bash
npm run dev
```
Then open http://localhost:3000

## Database (MySQL + Prisma)
1) Create a MySQL database (example name: `gmherbal`).
2) Update `DATABASE_URL` in `.env`:

```txt
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/gmherbal"
```

3) Generate client + run migration:
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Optional:

```bash
npm run db:studio
```
## Admin

- Page: `/admin`
- Set `.env` values before deployment:
	- `ADMIN_PASSWORD`
	- `ADMIN_SESSION_SECRET`
	- `API_KEY_ENCRYPTION_SECRET` (so admin can reveal stored partner API keys)

## Partner APIs

- Partner landing: `/partner`
- Create account (auto-login): `GET /partner/register` and `POST /api/partner/register`
- Login: `POST /api/partner/login` (sets cookie)
- Dashboard:
	- Overview: `/partner/dashboard`
	- Orders: `/partner/dashboard/orders`
	- API keys: `/partner/dashboard/api-keys`
	- Bank details: `/partner/dashboard/bank-details`

### API keys (partner-managed)

- List keys: `GET /api/partner/api-keys` (partner cookie)
- Create key: `POST /api/partner/api-keys` (returns the new key once)
- Delete key: `DELETE /api/partner/api-keys/:id`

### Partner authenticated APIs

- Products API: `GET /api/partner/products` with header `x-api-key: <key>`
- Orders:
	- Create: `POST /api/partner/orders` (partner cookie OR `x-api-key`)
	- List: `GET /api/partner/orders` (partner cookie OR `x-api-key`)
	- Detail: `GET /api/partner/orders/:id` (partner cookie OR `x-api-key`)

### Bank / payout details

- Get: `GET /api/partner/payout` (partner cookie)
- Update: `PATCH /api/partner/payout` (partner cookie)

Planned partner flow:
- Partners set their own selling price when creating an order.
- We deliver by COD, and partner profit is the price difference.

## Public APIs

- Products: `GET /api/public/products`
- Create order: `POST /api/public/order`
