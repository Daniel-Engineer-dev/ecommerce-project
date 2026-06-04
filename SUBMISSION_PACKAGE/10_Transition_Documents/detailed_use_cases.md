# Detailed Use Cases

## UC-01 Customer Buys Voucher

Primary actor: Customer

Preconditions:

- Customer is logged in.
- Voucher is approved, in selling period and has stock.

Main flow:

1. Customer searches or opens a voucher detail page.
2. Customer adds voucher to cart.
3. Customer reviews cart and quantity.
4. Customer enters checkout information.
5. Customer chooses VNPay, MoMo, VietQR or PayPal demo payment.
6. System validates stock and creates an order.
7. System receives payment confirmation.
8. System marks order as paid and issues unique e-voucher codes.
9. Customer views order history and e-voucher QR/barcode.

Alternative flows:

- If stock is insufficient, checkout is rejected.
- If payment fails, order is marked failed and e-voucher is not issued.
- If customer cancels before payment, stock is restored.

## UC-02 Partner Publishes Voucher

Primary actor: Partner

Preconditions:

- Partner account is approved by Admin.

Main flow:

1. Partner logs in to partner app.
2. Partner creates voucher with price, discount, period, quantity, terms and branches.
3. System stores voucher as pending.
4. Admin reviews voucher.
5. Admin approves or rejects voucher.
6. Approved voucher appears in customer catalog.

## UC-03 Partner Redeems E-Voucher

Primary actor: Partner

Preconditions:

- E-voucher is issued, unused and not expired.
- E-voucher belongs to the partner's voucher/branch scope.

Main flow:

1. Partner enters or scans voucher code.
2. System validates status, expiry and partner scope.
3. Partner confirms redemption.
4. System marks e-voucher as used and stores used branch/date.

## UC-04 Admin Handles Order

Primary actor: Admin

Main flow:

1. Admin opens Order Management.
2. Admin searches by order ID, customer, email or phone.
3. Admin opens order detail.
4. Admin marks payment as paid, cancels order or records simulated refund.
5. System updates order status, e-vouchers and system log.

## UC-05 Admin Handles Complaint

Primary actor: Admin

Main flow:

1. Admin opens Complaint Management.
2. Admin filters complaints by status.
3. Admin updates complaint status.
4. Admin sends response.
5. System stores response and writes audit log.
