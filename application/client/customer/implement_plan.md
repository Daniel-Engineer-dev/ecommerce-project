# Customer Implementation Plan

Date: 2026-05-26
Target execution date: 2026-05-27

Goal: finish the customer module against BR-CUS-01 to BR-CUS-08. Current state is close to complete, but several gaps remain around multi-category search, complaint linkage, registration verification simulation, payment demo clarity, lint quality, and migration/dump consistency.

## Current Completion Snapshot

- Build status: `npm.cmd run build` passes.
- Lint status: `npm.cmd run lint` fails because `HeroStat` is declared inside render in `Partners.jsx`; there are also multiple warnings.
- Database status: runtime DB has the required customer tables and constraints, including order status constraint, review uniqueness, complaint order FK, and unique user email/phone indexes.
- Migration file status: IDE shows `application/server/migrations/20260526_customer_requirements.sql`, but it was not found during filesystem audit. Confirm this before final handoff.

## Phase 1 - Fix Search And Navbar

Priority: High

Requirements covered:

- BR-CUS-03: search and filter vouchers by keyword, category, area, price, discount, partner, and effective status.

Files:

- `application/client/customer/src/components/Navbar.jsx`
- `application/client/customer/src/pages/SearchVouchers.jsx`
- `application/server/modules/shared/voucherService.js`
- `application/server/modules/shared/voucherController.js`

Tasks:

- Fix multi-category search from Navbar.
  - Current frontend sends `category=1,2,3`.
  - Backend currently handles category as a single value with `v.category_id = $n`.
  - Implement backend support for CSV category values or use a new `categoryIds` param.
  - Use `v.category_id = ANY($n::int[])` after safely parsing category IDs.
- Fix sub-header links.
  - Change `Deal Mới` from `/search?category=hot` to `/search?sort=new`.
  - Change `Deal Bán Chạy` from `/search?category=hot` to `/search?sort=best-selling`.
- Remove double encoding of keyword in Navbar.
  - `URLSearchParams` already encodes values.
  - Replace `params.append("q", encodeURIComponent(searchQuery))` with `params.append("q", searchQuery.trim())`.
- Sync `SearchVouchers.jsx` filter state with `location.search`.
  - If user navigates from Navbar or category links while already on `/search`, filter UI should reflect the URL.

Acceptance checks:

- Search by keyword works with Vietnamese text.
- Single category filter works.
- Multi-category filter works.
- Partner filter works.
- Area, price, discount, and sort still work.
- `Deal Mới` and `Deal Bán Chạy` show correct result order.
- No SQL error when category param contains multiple IDs.

## Phase 2 - Complete Complaint Flow

Priority: High

Requirements covered:

- BR-CUS-08: customer can create, track, and view complaints/responses linked to related order or voucher.

Files:

- `application/server/modules/customer/complaintService.js`
- `application/server/modules/customer/complaintController.js`
- `application/server/modules/customer/complaintRoutes.js`
- `application/client/customer/src/pages/Profile.jsx`

Tasks:

- Store `order_id` when creating a complaint.
  - `complaintService.createComplaint()` already accepts `orderId`.
  - Insert `order_id` into `Complaints`.
  - Keep ownership check: selected order must belong to the logged-in customer.
- Allow complaint to link vouchers.
  - UI should let customer select voucher/e-voucher from purchased items or from selected order detail.
  - Send `voucherIds` to `POST /api/complaints`.
- Improve complaint list and detail.
  - Show complaint status, priority, created date, related order, related vouchers, and response count.
  - Add detail view or expandable row to show `GET /api/complaints/:id` responses.
- Ensure access control.
  - Customer must only see own complaints.

Acceptance checks:

- Customer creates complaint with title, content, priority.
- Customer creates complaint linked to an order.
- Customer creates complaint linked to one or more vouchers.
- Customer can see complaint status and responses.
- User A cannot access User B's complaint detail.

## Phase 3 - Add Registration Verification Simulation

Priority: Medium High

Requirements covered:

- BR-CUS-01: register with email or phone, check duplicates, and pass a clear simulated verification step.

Files:

- `application/client/customer/src/pages/CustomerRegistration.jsx`
- Optional backend files if server-side OTP mock is preferred:
  - `application/server/modules/auth/authController.js`
  - `application/server/modules/auth/authService.js`

Recommended approach for demo:

- Keep duplicate checking through `/api/auth/check-availability`.
- Add a frontend verification step before calling `/api/auth/register`.
- Generate a visible demo code such as `123456` or a random 6-digit code shown in the UI as "Mã xác thực demo".
- User must enter the code before registration can be submitted.

Tasks:

- Add state for verification code, user input, and verification status.
- After step 1 availability check, move to verification step.
- Only allow final submit when verification is passed.
- Make UI text explicit that this is a simulated verification for demo.

Acceptance checks:

- Duplicate username/email/phone is blocked before verification.
- User cannot submit registration before entering the correct demo code.
- Email registration and phone registration both pass through verification.
- Successful registration still creates `Users` and `Customers` rows.

## Phase 4 - Clarify Payment Demo Behavior

Priority: Medium

Requirements covered:

- BR-CUS-06: create order and process simulated payments with correct order lifecycle and stock handling.
- BR-CUS-07: issue e-vouchers after successful payment.

Files:

- `application/client/customer/src/pages/Checkout.jsx`
- `application/client/customer/src/pages/PaymentStatus.jsx`
- `application/server/modules/customer/orderController.js`
- `application/server/utils/momo.js`
- `application/server/utils/paypal.js`

Tasks:

- MoMo:
  - Keep current sandbox gateway flow.
  - Document that IPN testing from mobile needs public HTTPS URL, such as ngrok.
- VietQR:
  - Rename confirm button/text to make it clear this is a demo confirmation.
  - Example: `Xác nhận thanh toán mô phỏng`.
  - Keep cancel/timeout stock restore behavior.
- PayPal:
  - If keeping mock fallback, label it as demo clearly in UI and code comments.
  - If using PayPal sandbox, configure env and remove mock success path.
- PaymentStatus:
  - Show clearer failure message when order fail endpoint cannot mark order failed.

Acceptance checks:

- MoMo sandbox redirects to payment page and only succeeds after valid return/IPN.
- VietQR demo confirmation completes the user's own order only.
- VietQR cancel/timeout marks order cancelled and restores stock.
- Failed payment marks pending order as failed and restores stock.
- E-vouchers are issued only for paid orders.

## Phase 5 - Fix Lint And Code Quality Issues

Priority: Medium

Requirements covered:

- Final quality gate for customer delivery.

Files:

- `application/client/customer/src/pages/Partners.jsx`
- Other files reported by `npm.cmd run lint`.

Tasks:

- Move `HeroStat` out of the `Partners` render function.
- Remove unused imports such as unused `motion`.
- Rename unused callback params to `_err` or remove them.
- Fix hook dependency warnings where practical:
  - `Checkout.jsx`
  - `SearchVouchers.jsx`
- Keep behavior unchanged while cleaning warnings.

Acceptance checks:

- `npm.cmd run build` passes.
- `npm.cmd run lint` has no errors.
- Prefer no warnings, but warnings can remain only if they are explicitly accepted and documented.

## Phase 6 - Verify Migration And Dump Consistency

Priority: High for handoff

Requirements covered:

- Ensures teammate can restore and run the same database state.

Files:

- `application/server/migrations/20260526_customer_requirements.sql`
- `scriptDatabase&ERD/dealzy_database.sql`

Tasks:

- Confirm `application/server/migrations/20260526_customer_requirements.sql` exists on disk.
- If missing, recreate it with:
  - delete duplicate reviews before adding unique constraint;
  - unique partial index on `lower(users.email)` when email is not null;
  - unique partial index on `users.phone` when phone is not null;
  - `orders_status_check`;
  - `reviews_customer_voucher_unique`;
  - nullable `complaints.order_id`;
  - FK from `complaints.order_id` to `orders.order_id` with `ON DELETE SET NULL`.
- Check `dealzy_database.sql` contains the same schema state.
- If dump is binary/custom format, document restore method clearly for pgAdmin4.

Acceptance checks:

- Fresh restored database has all required customer tables.
- Fresh restored database has all required constraints and indexes.
- Server starts against restored database without manual schema edits.

## Phase 7 - Final Customer Smoke Test

Priority: Final gate

Run after phases 1 to 6.

Checklist:

- Register customer by email.
- Register customer by phone.
- Duplicate username/email/phone is blocked.
- Registration verification simulation is required.
- Login/logout works.
- Forgot/reset password by email works if email env is configured.
- Forgot/reset password by phone works if SMS env is configured.
- Profile update works.
- Change password works.
- Protected routes redirect unauthenticated users to login.
- Search by keyword works.
- Search by single category works.
- Search by multiple categories works.
- Search by area works.
- Search by price range works.
- Search by minimum discount works.
- Search by partner works.
- Sort by new works.
- Sort by best-selling works.
- Voucher detail only shows active approved in-stock vouchers.
- Add to cart works.
- Cart quantity cannot exceed stock.
- Checkout validates cart against backend.
- MoMo sandbox flow works.
- VietQR demo success works.
- VietQR cancel restores stock.
- Failed payment restores stock.
- Paid order creates correct e-voucher quantity.
- Re-calling complete payment does not duplicate e-vouchers.
- Customer sees order history.
- Customer sees e-voucher code and QR.
- Customer can copy e-voucher code.
- Customer can review a paid voucher.
- Customer cannot review the same voucher twice.
- Customer can create complaint linked to order/voucher.
- Customer can view complaint responses.
- User A cannot access User B's order, e-voucher, or complaint.

## Suggested Execution Order For Tomorrow

1. Phase 1: Search and Navbar.
2. Phase 2: Complaint linkage and detail.
3. Phase 3: Registration verification simulation.
4. Phase 4: Payment demo clarity.
5. Phase 5: Lint/build cleanup.
6. Phase 6: Migration and dump verification.
7. Phase 7: Full smoke test.

## Commands To Run

Frontend:

```powershell
cd "d:\TMDT Software plan\application\client\customer"
npm.cmd run build
npm.cmd run lint
```

Backend syntax checks:

```powershell
cd "d:\TMDT Software plan"
node --check "application/server/modules/customer/orderService.js"
node --check "application/server/modules/customer/orderController.js"
node --check "application/server/modules/customer/complaintService.js"
node --check "application/server/modules/shared/voucherService.js"
node --check "application/server/modules/auth/authService.js"
```

Database checks through MCP or SQL:

```sql
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid IN (
  'orders'::regclass,
  'reviews'::regclass,
  'complaints'::regclass,
  'e_vouchers'::regclass,
  'users'::regclass
)
ORDER BY conname;
```

## Definition Of Done

Customer module is considered complete when:

- BR-CUS-01 through BR-CUS-08 acceptance checks pass.
- `npm.cmd run build` passes.
- `npm.cmd run lint` has no errors.
- Backend changed files pass `node --check`.
- Database migration/dump can recreate the required schema.
- Final smoke test passes with at least one real demo customer account.
