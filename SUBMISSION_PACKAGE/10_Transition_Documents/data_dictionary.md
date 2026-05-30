# Data Dictionary

| Table | Purpose | Key Fields |
| --- | --- | --- |
| Users | Shared login identity and role | user_id, username, password, email, phone, role |
| Customers | Customer profile | user_id, full_name, dob, address, is_active |
| Partners | Partner business profile | user_id, company_name, representative_name, tax_id, status, is_active |
| Branches | Partner redeem locations | branch_id, partner_id, branch_name, address, phone |
| Categories | Voucher categories | category_id, category_name |
| Vouchers | Voucher product definition | voucher_id, partner_id, category_id, title, price fields, stock fields, dates, status |
| Voucher_Branches | Voucher and branch mapping | voucher_id, branch_id |
| Orders | Customer purchase order | order_id, customer_id, total_amount, status, payment_method, transaction_reference, shipping fields |
| Order_Items | Purchased voucher lines | order_item_id, order_id, voucher_id, quantity, price_at_purchase |
| E_Vouchers | Issued electronic voucher codes | evoucher_id, order_item_id, unique_code, status, issued_at, expiry_date, used branch/date |
| Reviews | Customer reviews | review_id, voucher_id, customer_id, rating, comment |
| Complaints | Customer complaints | complaint_id, customer_id, title, content, status, priority |
| Complaint_Vouchers | Complaint to voucher mapping | complaint_id, voucher_id |
| Complaint_Responses | Admin/partner responses | response_id, complaint_id, responder_id, content |
| System_Logs | Audit log | log_id, user_id, action, table_name, record_id, created_at |
| Content_Items | Managed content entries | content_id, content_key, title, type, body, is_active, updated_at |

## Important Status Values

- Partner status: Pending, Approved, Rejected.
- Voucher status: Pending, Approved, Rejected, Suspended.
- Order status: Pending, Paid, Cancelled, Failed, Expired, Refunded.
- E-voucher status: Unused, Used, Expired, Locked.
- Complaint status: Pending, Processing, Resolved, Rejected.
