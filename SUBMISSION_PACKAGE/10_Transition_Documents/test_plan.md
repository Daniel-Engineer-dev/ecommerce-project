# Test Plan

## 1. Backend Static Checks

- Run `node --check` for every JavaScript file in `application/server`.
- Expected result: no syntax errors.

## 2. Frontend Build Checks

- Run `npm run build` in:
  - `application/client/customer`
  - `application/client/partner`
  - `application/client/admin`
- Expected result: all builds complete successfully. Bundle size warnings are acceptable for demo scope.

## 3. Manual Functional Tests

### Customer Purchase Flow
1. Login as a customer.
2. Search for an approved voucher.
3. Add voucher to cart.
4. Open checkout.
5. Choose VietQR demo payment.
6. Confirm VietQR payment.
7. Open profile/order history.
8. Verify that order is Paid and e-voucher codes are visible.

### Partner Redemption Flow
1. Login as partner who owns the voucher.
2. Open voucher/code verification.
3. Enter an unused e-voucher code.
4. Confirm redemption.
5. Verify code becomes Used and cannot be reused.

### Admin Moderation Flow
1. Login as admin.
2. Approve/reject a partner.
3. Approve/reject/suspend a voucher.
4. Open order management and update order status.
5. Open complaint management and send a response.
6. Open system logs and verify the operations were logged.

## 4. Regression Checks

- Customer catalog still loads.
- Partner dashboard still loads.
- Admin dashboard still loads.
- Checkout does not issue e-voucher before payment success.
- Cancelled/failed orders do not issue e-voucher.
