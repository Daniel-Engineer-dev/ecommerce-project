const pool = require('../../config/db');
const eventBus = require('../../utils/eventBus');

const normalizeCode = (code) => String(code || '').trim().toUpperCase();

class PartnerService {
    async getBranches(partnerId) {
        const result = await pool.query(
            'SELECT branch_id, branch_name, address, phone FROM Branches WHERE partner_id = $1 ORDER BY branch_id ASC',
            [partnerId]
        );
        return result.rows;
    }

    async getDashboard(partnerId) {
        const statsQuery = `
            SELECT
                COUNT(*)::int AS total_vouchers,
                COUNT(*) FILTER (WHERE status = 'Approved')::int AS approved_vouchers,
                COUNT(*) FILTER (WHERE status = 'Pending')::int AS pending_vouchers,
                COUNT(*) FILTER (WHERE status = 'Suspended')::int AS disabled_vouchers,
                COALESCE(SUM(total_quantity - quantity_stock), 0)::int AS issued_quantity
            FROM Vouchers
            WHERE partner_id = $1
        `;

        const revenueQuery = `
            SELECT
                COALESCE(SUM(oi.quantity), 0)::int AS sold_quantity,
                COALESCE(SUM(oi.price_at_purchase * oi.quantity), 0)::numeric AS revenue,
                COALESCE(COUNT(ev.evoucher_id) FILTER (WHERE ev.status = 'Used'), 0)::int AS used_quantity,
                COALESCE(COUNT(ev.evoucher_id) FILTER (WHERE ev.status = 'Unused'), 0)::int AS unused_quantity
            FROM Vouchers v
            LEFT JOIN Order_Items oi ON oi.voucher_id = v.voucher_id
            LEFT JOIN Orders o ON o.order_id = oi.order_id AND o.status IN ('Paid', 'Completed')
            LEFT JOIN E_Vouchers ev ON ev.order_item_id = oi.order_item_id
            WHERE v.partner_id = $1
        `;

        const [stats, revenue, recent] = await Promise.all([
            pool.query(statsQuery, [partnerId]),
            pool.query(revenueQuery, [partnerId]),
            this.getRecentActivity(partnerId, 12)
        ]);

        return {
            ...stats.rows[0],
            ...revenue.rows[0],
            recent_activity: recent.rows || recent
        };
    }

    async getRecentActivity(partnerId, limit = 50) {
        const result = await pool.query(
            `
            SELECT
                ev.evoucher_id,
                ev.unique_code,
                ev.status,
                ev.issued_at,
                ev.expiry_date,
                ev.used_date,
                ev.used_at_branch_id,
                v.voucher_id,
                v.title,
                v.sale_price,
                cat.category_name,
                oi.order_item_id,
                oi.quantity,
                oi.price_at_purchase,
                o.order_id,
                o.order_date,
                o.status AS order_status,
                c.full_name AS customer_name,
                u.email AS customer_email,
                u.phone AS customer_phone,
                used_branch.branch_name AS used_branch_name
            FROM E_Vouchers ev
            JOIN Order_Items oi ON oi.order_item_id = ev.order_item_id
            JOIN Vouchers v ON v.voucher_id = oi.voucher_id
            JOIN Categories cat ON cat.category_id = v.category_id
            JOIN Orders o ON o.order_id = oi.order_id
            LEFT JOIN Customers c ON c.user_id = o.customer_id
            LEFT JOIN Users u ON u.user_id = o.customer_id
            LEFT JOIN Branches used_branch ON used_branch.branch_id = ev.used_at_branch_id
            WHERE v.partner_id = $1
            ORDER BY COALESCE(ev.used_date, ev.issued_at) DESC
            LIMIT $2
            `,
            [partnerId, limit]
        );
        return result.rows;
    }

    async getVouchers(partnerId) {
        const query = `
            SELECT
                v.*,
                c.category_name,
                COALESCE(SUM(oi.quantity), 0)::int AS sold_quantity,
                COALESCE(COUNT(ev.evoucher_id) FILTER (WHERE ev.status = 'Used'), 0)::int AS used_quantity,
                COALESCE(array_remove(array_agg(DISTINCT vb.branch_id), NULL), '{}') AS branch_ids,
                COALESCE(string_agg(DISTINCT b.branch_name, ', '), '') AS branch_names
            FROM Vouchers v
            JOIN Categories c ON c.category_id = v.category_id
            LEFT JOIN Order_Items oi ON oi.voucher_id = v.voucher_id
            LEFT JOIN E_Vouchers ev ON ev.order_item_id = oi.order_item_id
            LEFT JOIN Voucher_Branches vb ON vb.voucher_id = v.voucher_id
            LEFT JOIN Branches b ON b.branch_id = vb.branch_id
            WHERE v.partner_id = $1
            GROUP BY v.voucher_id, c.category_name
            ORDER BY v.voucher_id DESC
        `;
        const result = await pool.query(query, [partnerId]);
        return result.rows;
    }

    async getVoucherById(partnerId, voucherId) {
        const result = await pool.query(
            'SELECT * FROM Vouchers WHERE voucher_id = $1 AND partner_id = $2',
            [voucherId, partnerId]
        );
        if (result.rows.length === 0) throw new Error('Voucher khong ton tai hoac khong thuoc doi tac nay');

        const branches = await pool.query(
            `SELECT b.branch_id, b.branch_name, b.address, b.phone
             FROM Voucher_Branches vb
             JOIN Branches b ON b.branch_id = vb.branch_id
             WHERE vb.voucher_id = $1
             ORDER BY b.branch_id`,
            [voucherId]
        );

        return { ...result.rows[0], branches: branches.rows };
    }

    async createVoucher(partnerId, data) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const payload = this.normalizeVoucherPayload(data);
            const insertQuery = `
                INSERT INTO Vouchers (
                    partner_id, category_id, title, description, image_url, discount_percent,
                    original_price, sale_price, total_quantity, quantity_stock, start_date,
                    expiry_date, terms_and_conditions, cancellation_policy, status
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$9,$10,$11,$12,$13,'Pending')
                RETURNING *
            `;
            const voucher = await client.query(insertQuery, [
                partnerId,
                payload.category_id,
                payload.title,
                payload.description,
                payload.image_url,
                payload.discount_percent,
                payload.original_price,
                payload.sale_price,
                payload.total_quantity,
                payload.start_date,
                payload.expiry_date,
                payload.terms_and_conditions,
                payload.cancellation_policy
            ]);

            await this.replaceVoucherBranches(client, partnerId, voucher.rows[0].voucher_id, data.branch_ids);
            await client.query('COMMIT');
            eventBus.emit('voucher.status_changed', {
                voucherId: voucher.rows[0].voucher_id,
                partnerId,
                status: voucher.rows[0].status,
                source: 'partner',
            });
            return voucher.rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async updateVoucher(partnerId, voucherId, data) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const existing = await client.query(
                'SELECT * FROM Vouchers WHERE voucher_id = $1 AND partner_id = $2 FOR UPDATE',
                [voucherId, partnerId]
            );
            if (existing.rows.length === 0) throw new Error('Voucher khong ton tai hoac khong thuoc doi tac nay');
            const currentVoucher = existing.rows[0];
            if (currentVoucher.status === 'Approved') {
                throw new Error('Voucher da duoc duyet. Doi tac chi co the tam ngung hoac gui yeu cau thay doi rieng.');
            }

            const payload = this.normalizeVoucherPayload(data);
            const committedQuantity = Math.max(0, Number(currentVoucher.total_quantity) - Number(currentVoucher.quantity_stock));
            if (payload.total_quantity < committedQuantity) {
                throw new Error('Tong so luong moi khong duoc nho hon so voucher da ban hoac dang giu cho');
            }
            const nextStock = payload.total_quantity - committedQuantity;
            const updateQuery = `
                UPDATE Vouchers
                SET category_id = $1, title = $2, description = $3, image_url = $4,
                    discount_percent = $5, original_price = $6, sale_price = $7,
                    total_quantity = $8, quantity_stock = $9,
                    start_date = $10, expiry_date = $11,
                    terms_and_conditions = $12, cancellation_policy = $13
                WHERE voucher_id = $14 AND partner_id = $15
                RETURNING *
            `;
            const updated = await client.query(updateQuery, [
                payload.category_id,
                payload.title,
                payload.description,
                payload.image_url,
                payload.discount_percent,
                payload.original_price,
                payload.sale_price,
                payload.total_quantity,
                nextStock,
                payload.start_date,
                payload.expiry_date,
                payload.terms_and_conditions,
                payload.cancellation_policy,
                voucherId,
                partnerId
            ]);

            await this.replaceVoucherBranches(client, partnerId, voucherId, data.branch_ids);
            await client.query('COMMIT');
            eventBus.emit('voucher.updated', {
                voucherId: updated.rows[0].voucher_id,
                partnerId,
                status: updated.rows[0].status,
                source: 'partner',
            });
            return updated.rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async submitVoucher(partnerId, voucherId) {
        const existing = await pool.query(
            'SELECT status FROM Vouchers WHERE voucher_id = $1 AND partner_id = $2',
            [voucherId, partnerId]
        );
        if (existing.rows.length === 0) throw new Error('Voucher khong ton tai hoac khong thuoc doi tac nay');
        if (existing.rows[0].status === 'Approved') {
            throw new Error('Voucher da duoc duyet. Doi tac chi co the tam ngung voucher nay.');
        }

        const result = await pool.query(
            "UPDATE Vouchers SET status = 'Pending' WHERE voucher_id = $1 AND partner_id = $2 RETURNING *",
            [voucherId, partnerId]
        );
        eventBus.emit('voucher.status_changed', {
            voucherId: result.rows[0].voucher_id,
            partnerId,
            status: result.rows[0].status,
            source: 'partner',
        });
        return result.rows[0];
    }

    async disableVoucher(partnerId, voucherId) {
        const result = await pool.query(
            "UPDATE Vouchers SET status = 'Suspended' WHERE voucher_id = $1 AND partner_id = $2 RETURNING *",
            [voucherId, partnerId]
        );
        if (result.rows.length === 0) throw new Error('Voucher khong ton tai hoac khong thuoc doi tac nay');
        eventBus.emit('voucher.status_changed', {
            voucherId: result.rows[0].voucher_id,
            partnerId,
            status: result.rows[0].status,
            source: 'partner',
        });
        return result.rows[0];
    }

    async checkVoucherCode(partnerId, code) {
        const uniqueCode = normalizeCode(code);
        if (!uniqueCode) throw new Error('Vui long nhap ma voucher');

        const result = await pool.query(
            `
            SELECT
                ev.evoucher_id, ev.unique_code, ev.status, ev.issued_at, ev.expiry_date,
                ev.used_date, ev.used_at_branch_id,
                oi.order_item_id, oi.quantity, oi.price_at_purchase,
                v.voucher_id, v.title, v.partner_id, v.terms_and_conditions,
                o.order_id, o.status AS order_status, o.order_date,
                c.full_name AS customer_name,
                used_branch.branch_name AS used_branch_name
            FROM E_Vouchers ev
            JOIN Order_Items oi ON oi.order_item_id = ev.order_item_id
            JOIN Vouchers v ON v.voucher_id = oi.voucher_id
            JOIN Orders o ON o.order_id = oi.order_id
            LEFT JOIN Customers c ON c.user_id = o.customer_id
            LEFT JOIN Branches used_branch ON used_branch.branch_id = ev.used_at_branch_id
            WHERE ev.unique_code = $1 AND v.partner_id = $2
            `,
            [uniqueCode, partnerId]
        );

        if (result.rows.length === 0) throw new Error('Ma voucher khong ton tai hoac khong thuoc doi tac nay');

        const voucher = result.rows[0];
        const branches = await pool.query(
            `SELECT b.branch_id, b.branch_name, b.address
             FROM Voucher_Branches vb
             JOIN Branches b ON b.branch_id = vb.branch_id
             WHERE vb.voucher_id = $1
             ORDER BY b.branch_id`,
            [voucher.voucher_id]
        );

        return {
            ...voucher,
            can_redeem: voucher.status === 'Unused' && (!voucher.expiry_date || new Date(voucher.expiry_date) > new Date()),
            branches: branches.rows
        };
    }

    async redeemVoucher(partnerId, code, branchId) {
        const checked = await this.checkVoucherCode(partnerId, code);
        if (!checked.can_redeem) {
            throw new Error(`Ma voucher dang o trang thai ${checked.status}, khong the su dung`);
        }
        if (!branchId) throw new Error('Vui long chon chi nhanh su dung');

        const branch = await pool.query(
            'SELECT branch_id FROM Branches WHERE branch_id = $1 AND partner_id = $2',
            [branchId, partnerId]
        );
        if (branch.rows.length === 0) throw new Error('Chi nhanh khong thuoc doi tac nay');

        const allowed = await pool.query(
            'SELECT 1 FROM Voucher_Branches WHERE voucher_id = $1 AND branch_id = $2',
            [checked.voucher_id, branchId]
        );
        if (allowed.rows.length === 0) throw new Error('Voucher khong ap dung tai chi nhanh nay');

        const result = await pool.query(
            `
            UPDATE E_Vouchers
            SET status = 'Used', used_at_branch_id = $1, used_date = CURRENT_TIMESTAMP
            WHERE unique_code = $2 AND status = 'Unused'
            RETURNING *
            `,
            [branchId, normalizeCode(code)]
        );
        if (result.rows.length === 0) throw new Error('Khong the cap nhat voucher. Ma co the da duoc su dung.');
        eventBus.emit('voucher_code.redeemed', {
            voucherId: checked.voucher_id,
            partnerId,
            code: normalizeCode(code),
            status: 'Used',
            source: 'partner',
        });
        return this.checkVoucherCode(partnerId, code);
    }

    async getReport(partnerId) {
        const dashboard = await this.getDashboard(partnerId);
        const vouchers = await this.getVouchers(partnerId);
        const recent_activity = await this.getRecentActivity(partnerId, 100);
        return { dashboard, vouchers, recent_activity };
    }

    normalizeVoucherPayload(data) {
        const originalPrice = Number(data.original_price);
        const salePrice = Number(data.sale_price);
        const totalQuantity = Number(data.total_quantity);

        if (!data.title?.trim()) throw new Error('Ten voucher la bat buoc');
        if (!data.category_id) throw new Error('Danh muc la bat buoc');
        if (!Number.isFinite(originalPrice) || !Number.isFinite(salePrice) || salePrice <= 0 || originalPrice <= 0) {
            throw new Error('Gia voucher khong hop le');
        }
        if (salePrice >= originalPrice) throw new Error('Gia ban phai nho hon gia goc');
        if (!Number.isInteger(totalQuantity) || totalQuantity <= 0) throw new Error('So luong phat hanh phai lon hon 0');
        if (!data.expiry_date) throw new Error('Han su dung voucher la bat buoc');

        return {
            category_id: Number(data.category_id),
            title: data.title.trim(),
            description: data.description || '',
            image_url: data.image_url || '',
            discount_percent: Math.max(0, Math.round(((originalPrice - salePrice) / originalPrice) * 100)),
            original_price: originalPrice,
            sale_price: salePrice,
            total_quantity: totalQuantity,
            start_date: data.start_date || new Date(),
            expiry_date: data.expiry_date,
            terms_and_conditions: data.terms_and_conditions || '',
            cancellation_policy: data.cancellation_policy || ''
        };
    }

    async replaceVoucherBranches(client, partnerId, voucherId, branchIds = []) {
        const selectedBranchIds = Array.isArray(branchIds) ? branchIds.map(Number).filter(Boolean) : [];
        const branches = selectedBranchIds.length > 0
            ? await client.query(
                'SELECT branch_id FROM Branches WHERE partner_id = $1 AND branch_id = ANY($2::int[])',
                [partnerId, selectedBranchIds]
            )
            : await client.query('SELECT branch_id FROM Branches WHERE partner_id = $1 ORDER BY branch_id', [partnerId]);

        if (selectedBranchIds.length > 0 && branches.rows.length !== selectedBranchIds.length) {
            throw new Error('Co chi nhanh khong thuoc doi tac nay');
        }

        await client.query('DELETE FROM Voucher_Branches WHERE voucher_id = $1', [voucherId]);
        for (const branch of branches.rows) {
            await client.query(
                'INSERT INTO Voucher_Branches (voucher_id, branch_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                [voucherId, branch.branch_id]
            );
        }
    }
}

module.exports = new PartnerService();
