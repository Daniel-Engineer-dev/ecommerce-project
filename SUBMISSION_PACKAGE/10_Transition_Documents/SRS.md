# Software Requirements Specification - Dealzy

## 1. Purpose

Dealzy is an e-commerce voucher platform for three roles: Customer, Partner and Admin. The system supports voucher discovery, partner voucher publishing, admin moderation, checkout, simulated payment, e-voucher issuing, redemption, complaints, reviews and reporting.

## 2. Scope

The implemented system includes:

- Customer app: register, login, profile, browse/search voucher, cart, checkout, payment status, order history, e-voucher display with QR/barcode, review and complaint.
- Partner app: register, manage profile/branches, create/manage vouchers, view performance, verify and redeem e-voucher codes.
- Admin app: dashboard, user management, partner approval, voucher approval, order management, complaint handling, content management and system logs.
- Backend API: Express.js modules for auth, shared voucher catalog, customer orders/complaints, partner workflows and admin workflows.
- Database: PostgreSQL relational schema for users, customers, partners, branches, categories, vouchers, orders, e-vouchers, reviews, complaints, content and system logs.

## 3. Functional Requirements

| ID | Requirement | Status |
| --- | --- | --- |
| FR-01 | User registration, login, password reset and role-based sessions | Implemented |
| FR-02 | Partner registration and admin approval | Implemented |
| FR-03 | Partner voucher creation and branch assignment | Implemented |
| FR-04 | Admin voucher approval/rejection/suspension | Implemented |
| FR-05 | Customer voucher search, detail view and cart | Implemented |
| FR-06 | Checkout with simulated VNPay, MoMo, VietQR and PayPal flows | Implemented |
| FR-07 | Issue unique e-voucher codes only after successful payment | Implemented |
| FR-08 | Partner verifies and redeems e-voucher code | Implemented |
| FR-09 | Customer review and complaint | Implemented |
| FR-10 | Admin order status/refund simulation | Implemented |
| FR-11 | Admin complaint response and status update | Implemented |
| FR-12 | Admin content management for banner/article/popup/policy entries | Implemented |
| FR-13 | System logs for important admin actions | Implemented |

## 4. Non-Functional Requirements

- Security: JWT authentication, role-based middleware, password hashing and restricted admin routes.
- Reliability: checkout uses transactions and stock locking to reduce overselling in demo scope.
- Auditability: admin actions are written to `System_Logs`.
- Maintainability: backend is split by modules: auth, shared, customer, partner and admin.
- Usability: separate frontend apps for each role with direct role-specific workflows.

## 5. Constraints

- Payment gateways are demo/sandbox-oriented.
- Email/SMS/OTP can be simulated.
- QR scanning can be simulated by code input or generated QR/barcode display.
- The system is designed for coursework demonstration, not production operation.
