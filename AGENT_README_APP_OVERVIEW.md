# Dealzy — Quick App Overview (for agents)

## 1) Repo structure (what to look at)

### Frontend (3 React apps)

Located under `application/client/`:

- `customer/`: user/customer UI (browse vouchers, cart, checkout, voucher detail, etc.)
- `partner/`: partner dashboard UI (manage vouchers they publish, redeem/verify codes, reports, profile)
- `admin/`: admin dashboard UI (approve/reject partners, manage users/orders/complaints, manage content, view system logs)

Each React app has its own `src/`, `package.json`, `vite.config.js`.

### Backend (Node.js + Express)

Located under `application/server/`:

- `index.js`: Express entry + global route mounting
- `config/db.js`: PostgreSQL connection pool
- `middleware/authMiddleware.js`: JWT verification and `req.user` injection
- `modules/`: feature modules, each typically split into:
  - `*Routes.js` (endpoints)
  - `*Controller.js` (request/response orchestration)
  - `*Service.js` (business logic + DB queries)
- `utils/`: external integration helpers (email/sms/payments/logging/etc.)
- `migrations/`: SQL scripts used by the project (example: `20260526_customer_requirements.sql`)

## 2) Backend API routes (base paths)

Mounted in `application/server/index.js`:

- `GET /` health check
- `/api/vouchers` → `modules/shared/voucherRoutes.js`
- `/api/auth` → `modules/auth/authRoutes.js`
- `/api/admin` → `modules/admin/adminRoutes.js`
- `/api/partner` → `modules/partner/partnerRoutes.js` (partner dashboard endpoints)
- `/api/admin/vouchers` → `modules/admin/adminVoucher/adminVoucherRoute.js`
- `/api/orders` → `modules/customer/orderRoutes.js`
- `/api/complaints` → `modules/customer/complaintRoutes.js`

### Auth endpoints (`/api/auth`)

Defined in `modules/auth/authRoutes.js`:

- `POST /register`
- `POST /login`
- `POST /refresh-token`
- `POST /check-availability`
- `POST /forgot-password`
- `POST /verify-otp`
- `POST /reset-password/:token`
- `GET /profile` (JWT required)
- `PUT /profile` (JWT required)
- `POST /change-password` (JWT required)

Backend uses JWT access/refresh tokens:

- Access token: short expiry (default `15m`)
- Refresh token: longer expiry (default `7d`)

Frontend token storage differs per app:

- customer: `localStorage.token`, `localStorage.refreshToken`, `localStorage.user`
- partner: `localStorage.partnerToken`, `localStorage.partnerUser`
- admin: `localStorage.adminToken` (and admin login page uses that)

### Voucher browsing endpoints (`/api/vouchers`)

Defined in `modules/shared/voucherRoutes.js`:

- `GET /` → list vouchers
- `GET /categories`
- `GET /partners`
- `GET /search` → search vouchers
- `GET /:id` → voucher detail

### Admin endpoints (role-gated)

Admin router: `application/server/modules/admin/adminRoutes.js`

- JWT middleware: `auth`
- Extra gate: `adminOnly` checks `req.user.role === 'Admin'`

Key endpoints:

- Partner approval:
  - `GET /partners/pending`
  - `POST /partners/approve/:id`
  - `POST /partners/reject/:id`
- Users:
  - `GET /users/stats`
  - `GET /users`
  - `GET /users/:id`
  - `PATCH /users/:id/toggle-lock`
  - `PATCH /users/:id/role`
- Orders:
  - `GET /orders`
  - `GET /orders/:id`
  - `PATCH /orders/:id/status`
- Complaints:
  - `GET /complaints`
  - `PATCH /complaints/:id/status`
  - `POST /complaints/:id/responses`
- System logs:
  - `GET /logs`
- Content management:
  - `GET /content`
  - `POST /content`

## 3) Frontend routing (quick mental model)

### Customer app routing (`customer/src/App.jsx`)

Uses `react-router-dom`.
Important routes:

- `/auth` (login/register)
- `/reset-password/:token`
- `/register-customer`, `/register-partner`
- `/` home
- `/partners`, `/access` (partner portal landing)
- `/cart`
- `/profile` (protected)
- `/checkout` (protected)
- `/payment/status` (protected)
- `/search`, `/voucher/:id`

Protected routes are implemented by checking `localStorage.getItem('token')`.

### Partner app routing (`partner/src/App.jsx`)

If `partnerToken` not found → renders `AuthPage`.
If logged in → shows `PartnerShell` with routes like:

- `/` dashboard
- `/vouchers`
- `/redeem`
- `/reports`
- `/settings`

Partner UI calls backend with its own API helper using:
`Authorization: Bearer ${localStorage.getItem('partnerToken')}`.

### Admin app routing (`admin/src/App.jsx`)

If `adminToken` not found → redirect to `/login`.
Admin layout routes (within the protected area):

- `/` admin dashboard
- `/partners`
- `/users`
- `/vouchers`
- `/orders`
- `/complaints`
- `/content`
- `/logs`

## 4) How frontend calls backend (token + refresh)

### Customer `apiClient.js`

`application/client/customer/src/apiClient.js`:

- Adds `Authorization: Bearer <token>` when token exists
- If response status is `401` and `retry=true`, it calls
  `POST ${API_BASE_URL}/api/auth/refresh-token` with `refreshToken`.
- On refresh failure: clears session and redirects to `/auth?redirect=...`.

### Partner API helper (in partner App)

`partner/src/App.jsx` defines a local `apiFetch()`:

- Uses `partnerToken`
- Throws error if `response.ok` is false.

## 5) Key backend patterns to follow (for editing)

1. **Routes**: define endpoints + attach middleware.
2. **Controllers**: handle `req/res`, validate input minimally, call service.
3. **Services**: DB queries and core business logic.
4. **Auth**: verify JWT via `middleware/authMiddleware.js` → sets `req.user`.
5. **Admin gating**: explicit role checks in `adminRoutes.js` (not just JWT).

> If you add new endpoints: follow the same Route/Controller/Service split for maintainability.

## 6) Common workflows (agent checklist)

- **Find a feature**: locate its router in `application/server/modules/**/**Routes.js`.
- **Trace request**: Route → Controller → Service (then DB access).
- **Update UI**: locate the React page under `application/client/<app>/src/pages/` and check how it builds API paths.
- **Auth issues**: confirm which token key the specific frontend app uses (`token` vs `partnerToken` vs `adminToken`).

## 7) Where to add documentation for new agent tasks

Preferred locations:

- Update this overview file only if overall architecture changes.
- For feature-specific details, add a short section in the relevant module folder (new `.md`) or under `documents/report/sections/` if it belongs to the report.
