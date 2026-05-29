# Dealzy Presentation Slide Deck

## Slide 1 - Project

Dealzy: E-commerce voucher platform for Customer, Partner and Admin.

## Slide 2 - Problem

Businesses need a controlled way to publish discount vouchers. Customers need to buy and redeem vouchers online. Admins need moderation, monitoring and auditability.

## Slide 3 - Roles

- Customer: browse, buy, pay, receive and use e-vouchers.
- Partner: publish vouchers and redeem codes.
- Admin: approve, manage, monitor and audit.

## Slide 4 - Business Flow

Partner registers -> Admin approves partner -> Partner creates voucher -> Admin approves voucher -> Customer buys voucher -> Payment succeeds -> E-voucher is issued -> Partner redeems code.

## Slide 5 - Main Modules

- Auth and role-based access.
- Voucher catalog and moderation.
- Cart, checkout and payment simulation.
- E-voucher issuing and redemption.
- Reviews, complaints and support.
- Admin dashboard, order management, content and system logs.

## Slide 6 - Database

Core entities: Users, Customers, Partners, Branches, Categories, Vouchers, Orders, Order_Items, E_Vouchers, Reviews, Complaints, Content_Items and System_Logs.

## Slide 7 - Demo Flow

1. Admin approves partner/voucher.
2. Customer buys voucher and confirms demo payment.
3. Customer sees e-voucher QR/barcode.
4. Partner redeems e-voucher.
5. Admin checks order and system log.

## Slide 8 - Completed Requirements

The current `partner` branch includes the full end-to-end voucher lifecycle and the new admin operation screens for orders, complaints, content and logs.

## Slide 9 - Remaining Risk

Payment integrations are still demo/sandbox-oriented. Final video recording should be produced after confirming local environment and seed data.

## Slide 10 - Conclusion

Dealzy demonstrates a complete coursework-level e-commerce voucher system with clear role separation, relational data design and traceable business workflows.
