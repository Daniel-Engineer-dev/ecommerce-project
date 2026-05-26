# Customer Implementation Summary

Date: 2026-05-26

This document records the implementation work completed for the customer module based on `implement_plan.md`.

## Baseline

- Checked git worktree before implementation.
- Ran customer frontend production build successfully with `npm.cmd run build`.
- Reviewed existing customer frontend pages, backend customer order module, shared voucher module, and auth module.
- Confirmed the existing implementation already had basic checkout, e-voucher wallet, review, profile, and payment status flows, but several business rules were missing or incomplete.

## Backend Changes

### Order security and ownership

Files changed:

- `application/server/modules/customer/orderService.js`
- `application/server/modules/customer/orderController.js`
- `application/server/modules/customer/orderRoutes.js`

Implemented:

- Added ownership checks so customers can only access their own orders.
- `GET /api/orders/evouchers/:orderId` now validates:
  - the order belongs to the logged-in customer;
  - the order status is `Paid`.
- `POST /api/orders/confirm-vietqr` now completes only the logged-in customer's order.
- Added reusable `assertCustomerOwnsOrder(orderId, customerId)`.
- Public payment callbacks still support gateway flows, while authenticated customer actions enforce ownership.

### Cart validation and checkout rules

Implemented:

- Added `POST /api/orders/validate-cart`.
- Cart validation checks:
  - voucher exists;
  - voucher status is `Approved`;
  - `start_date <= NOW()`;
  - `expiry_date > NOW()`;
  - `quantity_stock` is enough;
  - quantity is positive integer.
- Backend now merges duplicate `voucher_id` rows in a checkout payload before validating stock.
- Checkout total is calculated from DB prices only.
- Checkout still relies on the existing DB trigger to deduct stock when `order_items` are inserted.

### Order lifecycle and stock restore

Implemented:

- Added order statuses supported in code:
  - `Pending`
  - `Paid`
  - `Cancelled`
  - `Failed`
  - `Expired`
- Added `POST /api/orders/:orderId/cancel`.
- Added `POST /api/orders/:orderId/fail`.
- Cancel/fail is only allowed for `Pending` orders.
- Cancel/fail restores stock by adding quantities from `order_items` back to `vouchers.quantity_stock`, capped by `total_quantity`.
- `completeOrder` now:
  - only completes `Pending` orders;
  - treats already `Paid` orders as idempotent success;
  - only creates missing e-vouchers, preventing duplicate issuance.

### Order history

Implemented:

- Added `GET /api/orders/my-orders`.
- Added `GET /api/orders/:orderId`.
- Responses include order status, payment info, total amount, item count, e-voucher count, and order item details.
- Detail endpoint returns e-vouchers only when the order is `Paid`.

### E-voucher wallet data

Implemented:

- E-voucher queries now include:
  - `evoucher_id`
  - `used_at_branch_id`
  - `used_date`
  - `used_branch_name`
  - voucher and partner information
- Wallet still limits results to the logged-in customer's paid orders.

### Reviews

Implemented:

- Review creation still requires the customer to have bought the voucher.
- Backend check now requires the related order to be `Paid`.
- Backend still prevents duplicate reviews at service level.
- Migration adds a DB-level unique constraint after deleting existing duplicate review rows.

### Complaints

Files added:

- `application/server/modules/customer/complaintService.js`
- `application/server/modules/customer/complaintController.js`
- `application/server/modules/customer/complaintRoutes.js`

Files changed:

- `application/server/index.js`

Implemented:

- Registered `/api/complaints`.
- Added `POST /api/complaints`.
- Added `GET /api/complaints/my`.
- Added `GET /api/complaints/:id`.
- Complaint reads are scoped to the logged-in customer.
- Complaint creation supports title, content, priority, and related voucher IDs.
- Service includes order ownership validation support for future order-linked complaints.

### Voucher customer visibility

File changed:

- `application/server/modules/shared/voucherService.js`

Implemented:

- Customer voucher list, search, and detail now only expose vouchers that are:
  - `Approved`;
  - already started;
  - not expired;
  - in stock.
- Partner filter support already existed in backend search and is now wired to the frontend.

### Auth and profile

Files changed:

- `application/server/modules/auth/authService.js`
- `application/server/modules/auth/authController.js`

Implemented:

- `POST /api/auth/check-availability` now checks real DB data for:
  - username;
  - email;
  - phone.
- Profile update now checks email/phone conflicts against other users.

## Frontend Changes

### Route protection

File changed:

- `application/client/customer/src/App.jsx`

Implemented:

- Added `ProtectedRoute`.
- Protected:
  - `/profile`
  - `/checkout`
  - `/payment/status`
- Unauthenticated users are redirected to `/auth?redirect=...`.

### Cart stock limits

Files changed:

- `application/client/customer/src/context/CartContext.jsx`
- `application/client/customer/src/pages/Cart.jsx`

Implemented:

- Cart now stores `quantity_stock` on items.
- Adding to cart and updating quantity are capped by available stock.
- Cart UI disables the plus button when quantity reaches stock.
- Cart displays remaining stock when available.

### Checkout validation and VietQR cancel

File changed:

- `application/client/customer/src/pages/Checkout.jsx`

Implemented:

- Checkout calls `POST /api/orders/validate-cart` before creating an order.
- Checkout shows server validation errors for unavailable/out-of-stock vouchers.
- VietQR pending order ID is tracked client-side.
- VietQR cancel button calls `POST /api/orders/:orderId/cancel`.
- VietQR timeout also attempts to cancel the pending order and restore stock.

### Payment status

File changed:

- `application/client/customer/src/pages/PaymentStatus.jsx`

Implemented:

- Payment failure attempts to mark the pending order failed through `POST /api/orders/:orderId/fail`.
- Successful payment e-voucher display now includes a real QR image generated from `unique_code`.
- Added copy-code action for e-vouchers.

### Profile

File changed:

- `application/client/customer/src/pages/Profile.jsx`

Implemented:

- Added customer order history tab.
- Added customer complaint tab.
- Order history loads from `GET /api/orders/my-orders`.
- Complaint tab can create a complaint and list existing complaints from `/api/complaints/my`.

### Search

File changed:

- `application/client/customer/src/pages/SearchVouchers.jsx`

Implemented:

- Added partner list loading from `/api/vouchers/partners`.
- Added partner dropdown filter.
- Partner filter is included in search query params.

### Customer registration

File changed:

- `application/client/customer/src/pages/CustomerRegistration.jsx`

Implemented:

- Step 1 now calls `/api/auth/check-availability`.
- Registration is blocked early when username, email, or phone already exists.

## Database Migration

File added:

- `application/server/migrations/20260526_customer_requirements.sql`

Migration includes:

- Deletes duplicate review rows, keeping the earliest row per `(customer_id, voucher_id)`.
- Adds unique partial index on `lower(users.email)` when email is not null.
- Adds unique partial index on `users.phone` when phone is not null.
- Adds `orders_status_check` constraint for supported order statuses.
- Adds unique constraint `reviews_customer_voucher_unique`.
- Adds nullable `complaints.order_id`.
- Adds foreign key from `complaints.order_id` to `orders.order_id` with `ON DELETE SET NULL`.

## Verification

Completed checks:

- Customer frontend build passed:
  - `npm.cmd run build`
- Backend syntax checks passed with `node --check` on changed/new backend files.
- `git diff --check` returned no whitespace errors, only Windows line-ending warnings.
- Backend dev server responded at `http://localhost:5000/`.
- Customer frontend dev server responded at `http://127.0.0.1:5173/`.

Known remaining items:

- The app still contains existing mojibake Vietnamese text in many files. This was not fully refactored to avoid broad unrelated churn.
- Frontend bundle still warns about a large chunk, mostly due to existing media/assets and lack of route-level code splitting.
- Complaint UI is functional but basic; richer complaint detail and response display can be improved later.
- Registration verification is still a simulated/availability step, not a full OTP-backed registration verification flow.
