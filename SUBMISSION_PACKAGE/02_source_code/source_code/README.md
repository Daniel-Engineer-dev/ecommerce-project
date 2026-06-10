# Dealzy Source Code

## Structure

- `application/client/customer`: Customer storefront.
- `application/client/partner`: Partner portal.
- `application/client/admin`: Administrator console.
- `application/server`: Node.js/Express backend.
- `../database_script_and_seed/scriptDatabase.sql`: Current Supabase schema and consistent demo seed.

## Requirements

- Node.js 20 or newer.
- PostgreSQL/Supabase.

## Database

Run `database_script_and_seed/scriptDatabase.sql` on a fresh PostgreSQL database.
The script recreates the current Supabase `public` schema, inserts a consistent
demo dataset, and finishes with consistency verification queries.

Seeded accounts use the shared password:

```text
Demo@123
```

Available usernames:

```text
admin_demo
partner_demo
partner_pending_demo
customer_demo
```

## Backend

Create `application/server/.env` from `.env-sample`, configure the database and
secrets, then run:

```bash
cd application/server
npm install
npm start
```

## Frontends

Run each frontend separately:

```bash
cd application/client/customer
npm install
npm run dev
```

Repeat for `partner` and `admin`. Configure `VITE_API_URL` when the backend is
not available at `http://localhost:5000`.

## Security

Real credentials and local `.env` files are intentionally excluded. Replace all
placeholder secrets before deployment.
